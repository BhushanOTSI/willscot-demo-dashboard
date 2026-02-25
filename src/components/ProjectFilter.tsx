import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { useProjects, type Project } from "@/hooks/useProjects";
import { useStore } from "@/stores/useStore";

export function ProjectFilter() {
  const { data, isLoading } = useProjects();
  const { selectedProject, setSelectedProject } = useStore();

  const projects = data?.projects || [];
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  // Pre-select first project when data loads
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject, setSelectedProject]);

  const handleValueChange = (value: string | null) => {
    const project = projects.find((p) => p.id === value);
    setSelectedProject(project || null);
    setOpen(false);
  };

  return (
    <Field className="w-[300px]">
      <FieldLabel htmlFor="project-filter">Project</FieldLabel>
      <div ref={anchorRef}>
        <Combobox
          items={projects}
          open={open}
          onOpenChange={setOpen}
          value={selectedProject?.name || null}
          onValueChange={handleValueChange}
          disabled={isLoading}
        >
          <ComboboxInput
            id="project-filter"
            placeholder={isLoading ? "Loading..." : "Select a project"}
            disabled={isLoading}
            showClear
          />
          <ComboboxContent anchor={anchorRef}>
            <ComboboxEmpty>No projects found.</ComboboxEmpty>
            <ComboboxList>
              {(project: Project) => (
                <ComboboxItem key={project.id} value={project.id}>
                  {project.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </Field>
  );
}

