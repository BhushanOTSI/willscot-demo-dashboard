import { useQuery } from '@tanstack/react-query';

export interface SpanMetadata {
  BotId: string;
  AADTenantId: string;
  BotName: string;
  BatchId: number;
}

export interface LLMOutputMessage {
  'message.role': string;
  'message.content': string;
}

export interface SpanData {
  'context.trace_id': string;
  'context.span_id': string;
  'attributes.openinference.span.kind': string;
  parent_id: string | null;
  name: string;
  start_time: string;
  end_time: string;
  'attributes.llm.cost.completion': number | null;
  'attributes.llm.cost.total': number | null;
  'attributes.llm.token_count.completion': number | null;
  'attributes.llm.token_count.total': number | null;
  'attributes.llm.model_name': string;
  'attributes.metadata': SpanMetadata;
  'attributes.text': string | null;
  'attributes.llm.output_messages': LLMOutputMessage[] | null;
}

export interface SpansExportResponse {
  project_name: string;
  row_count: number;
  columns: string[];
  start_time_low: string;
  start_time_high: string;
  where: string | null;
  data: SpanData[];
}

export interface UseSpansExportParams {
  projectName?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Hook to fetch spans export data via POST request
 * @param params - Query parameters
 * @param params.projectName - Project name (default: 'CopilotStudio4')
 * @param params.startTime - Start time in ISO format (default: '2026-02-01T00:00:00Z')
 * @param params.endTime - End time in ISO format (default: '2026-02-25T23:59:59Z')
 * @param options - Additional useQuery options
 * @returns Query result from react-query
 */
export const useSpansExport = <TData = SpansExportResponse>(
  params: UseSpansExportParams = {},
  options = {}
) => {
  const {
    projectName = 'CopilotStudio4',
    startTime = '2026-02-01T00:00:00Z',
    endTime = '2026-02-25T23:59:59Z',
  } = params;

  return useQuery<SpansExportResponse, Error, TData>({
    queryKey: ['spansExport', projectName, startTime, endTime],
    queryFn: async () => {
      const url = new URL('https://willscot-ariza-api.vercel.app/spans/export');
      url.searchParams.set('project_name', projectName);
      url.searchParams.set('start_time', startTime);
      url.searchParams.set('end_time', endTime);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch spans export: ${response.statusText}`);
      }

      return response.json();
    },
    ...options,
  });
};

