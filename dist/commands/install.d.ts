export interface InstallCommandOptions {
    project?: string;
    dir?: string;
}
export declare function install(options?: InstallCommandOptions): Promise<void>;
export default install;
