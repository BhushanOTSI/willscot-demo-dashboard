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
  next_cursor: string | null;
}

export interface UseSpansExportParams {
  projectName?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
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
    projectName = '',
    startTime = '',
    endTime = '',
    limit = 100,
  } = params;

  return useQuery<SpansExportResponse, Error, TData>({
    queryKey: ['spansExport', projectName, startTime, endTime],
    queryFn: async () => {
      const allData: SpanData[] = [];
      let cursor: string | null = null;
      let firstResponse: SpansExportResponse | null = null;

      do {
        const url = new URL('https://willscot-ariza-api.vercel.app/spans/export_new');
        url.searchParams.set('project_name', projectName);
        url.searchParams.set('start_time_low', startTime);
        url.searchParams.set('start_time_high', endTime);
        url.searchParams.set('limit_per_page', limit.toString());

        if (cursor) {
          url.searchParams.set('cursor', cursor);
        }

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cursor ? { cursor } : {}),
        });

        if (response.ok) {
          const data: SpansExportResponse = await response.json();

          if (!firstResponse) {
            firstResponse = data;
          }

          if (data.data && Array.isArray(data.data)) {
            allData.push(...data.data);
          }

          cursor = data.next_cursor;
        }

        if (!firstResponse) {
          firstResponse = {
            project_name: projectName,
            row_count: 0,
            columns: [],
            start_time_low: startTime,
            start_time_high: endTime,
            where: null,
            data: [],
            next_cursor: null,
          };
        }

      } while (cursor);


      const finalResponse: SpansExportResponse = {
        ...firstResponse,
        data: allData,
        row_count: allData.length,
        next_cursor: null,
      }

      return finalResponse;
    },
    ...options,
  });
};

