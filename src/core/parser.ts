export type Files = {
    path: string,
    content: string,
    name: string;
};


type workflowType = {
    type: string;
    key: string;
    repoName?: string;
    order: number;
    commands?: any;
    files?: Files[];
    envVars?: string[]; // will remove in future no need as we have the all the deps and envs in the metadata
    dependencies?: string[]; // will remove in future no need as we have the all the deps and envs in the metadata
    devDependencies?: string[]; // will remove in future no need as we have the all the deps and envs in the metadata
}

interface Respose {
    success: boolean,
    mssg: string,
    data: {
        workflow: workflowType[];
        metadata: {
            envVars: string[];
            dependencies: string[];
            devDependencies: string[];
        };
    };
}

export async function parsePlan(buildPlan: any): Promise<Respose> {
    try {
        if (!buildPlan.workflow || !Array.isArray(buildPlan.workflow)) {
            throw new Error("Invalid build plan structure");
        }

        const workflows: workflowType[] = buildPlan.workflow
            .sort((a: any, b: any) => a.order - b.order)
            .map((w: any) => ({
                type: w?.type,
                key: w?.key,
                order: w.order,
                ...(w.repoName && { repoName: w.repoName }),
                ...(w.files && { files: w.files }),
                ...(w.commands && { commands: w.commands }),
            }));

        return {
            success: true,
            mssg: "Plan parsed successfully",
            data: {
                workflow: workflows,
                metadata: buildPlan.metadata
            }
        };
    } catch (error: any) {
        return {
            success: false,
            mssg: `Failed to parse Plan: ${error.message}`,
            data: {
                workflow: [],
                metadata: {
                    envVars: [],
                    dependencies: [],
                    devDependencies: []
                }
            }
        };
    }
}