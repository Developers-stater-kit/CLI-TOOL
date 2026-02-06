export type FileMap = {
    source: string;
    destination: string;
    strategy: "copy" | "merge" | "overwrite";
    renameto: string;
};


type workflowType = {
    type: string;
    key: string;
    repoName?: string;
    order: number;
    commands?: any;
    fileMap?: FileMap[];
}

interface Respose {
    success: boolean,                       
    mssg: string,
    data: {
        workflow: workflowType[];
        metadata: {
            allEnvVars: string[];
            dependencies: string[];
            devDependencies: string[];
        };
    };
}

export async function parseBuildPlan(buildPlan: any): Promise<Respose> {
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
                ...(w.commands && { commands: w.commands }),
                ...(w.fileMap && { steps: w.fileMap })
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
                    allEnvVars: [],
                    dependencies: [],
                    devDependencies: []
                }
            }
        };
    }
}