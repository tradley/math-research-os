import { EliteNotebook } from "@/components/workspace/elite-notebook";
import { SectionHeader } from "@/components/ui/section-header";

export default function WorkspacePage() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionHeader eyebrow="Notebook" title="Research workspace" description="Structured notebook blending mathematical exposition, computations, and conjecture capture." />
      <EliteNotebook />
    </div>
  );
}
