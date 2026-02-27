import { useQuery } from '@tanstack/react-query';

export interface Project {
  name: string;
  id: string;
  space_id: string;
}

export interface ProjectsResponse {
  space_id: string;
  project_count: number;
  projects: Project[];
}

export interface UseProjectsParams {
  limit?: number;
}

/**
 * Hook to fetch projects data via GET request
 * @param params - Query parameters
 * @param params.limit - Limit number of projects to fetch (default: 100)
 * @param options - Additional useQuery options
 * @returns Query result from react-query
 */
export const useProjects = <TData = ProjectsResponse>(
  params: UseProjectsParams = {},
  options = {}
) => {
  const { limit = 100 } = params;

  return useQuery<ProjectsResponse, Error, TData>({
    queryKey: ['projects', limit],
    queryFn: async () => {
      const url = new URL('https://willscot-ariza-api.vercel.app/getprojects');
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        return {
          space_id: '',
          project_count: 0,
          projects: [],
        };
      }

      const data: ProjectsResponse = await response.json();

      return data;
    },
    ...options,
  });
};

