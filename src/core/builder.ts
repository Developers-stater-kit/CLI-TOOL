import { parsePlan } from "./parser";
import { fail, succeed } from "../components/loader";
import { manager } from "./manager";
import { uiSuccess } from "../components/ui/ui-tools";

export async function buildProject(
  rawPlan: any,
  projectName: string
) {
  try {
    // 1. Parse
    const plan = await parsePlan(rawPlan);

    if (!plan.success) {
      fail(plan.mssg);
      process.exit(1);
    }
    uiSuccess("Plan Generated Successfully");
    // console.log(plan.data)

    // 2. Call Manager
    await manager({
      projectName,
      workflow: plan.data.workflow,
      metadata: plan.data.metadata
    });

  } catch (error: any) {
    fail(error.message || "Build failed");
    process.exit(1);
  }
}
