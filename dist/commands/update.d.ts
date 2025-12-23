export interface UpdateCommandOptions {
    force?: boolean;
}
export declare function update(options?: UpdateCommandOptions): Promise<void>;
export default update;
