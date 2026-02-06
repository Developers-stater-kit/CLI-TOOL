import { parseBuildPlan } from "./parser";
import { fail, succeed } from "../components/loader";
import { manager } from "./manager";

export async function buildProject(
  rawPlan: any,
  projectName: string
) {
  try {

    // 1. Parse
    const plan = await parseBuildPlan(rawPlan);

    if (!plan.success) {
      fail(plan.mssg);
      process.exit(1);
    }
    // console.log(JSON.stringify(plan.data, null, 2))

    succeed(plan.mssg || "Plan Parsed Successfully");

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
