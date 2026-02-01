export interface ParsedPlan {
    name: string;
    scope: string;
    appType: string;
    repos: repoType[];
    metadata: {
        allEnvVars: string[];
    };
}


type repoType = {
    type: string;
    key: string;
    repoName: string;
    order: number;
    version: string;
}

type Respose = {
    success: boolean,
    mssg: string,
    data: repoType[]
}

export async function parseBuildPlan(buildPlan: any): Promise<Respose> {
    try {
        if (!buildPlan.repos || !Array.isArray(buildPlan.repos)) {
            throw new Error("Invalid build plan structure");
        }

        const repos: repoType[] = buildPlan.repos
            .sort((a: any, b: any) => a.order - b.order)
            .map((repo: any) => ({
                repoName: repo.repoName,
                order: repo.order,
                
            }));

        // console.log("Repos to download:", repos);

        return {
            success: true,
            mssg: "Plan parsed successfully",
            data: repos
        };
    } catch (error: any) {
        return {
            success: false,
            mssg: `Failed to parse Plan: ${error.message}`,
            data: []
        };
    }
}