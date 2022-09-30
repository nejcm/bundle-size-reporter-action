export type Args = {
  branchPath: string;
  path: string;
  onlyDiff: boolean;
};

export type BundleInfo = Record<
  string,
  {
    bundled?: number;
    minified?: number;
    gzipped?: number;
  }
>;

export type Report = {
  name: string;
  oldSize: number;
  newSize: number;
  diff: number;
  percentage: string;
};

export type GroupReport = Record<string, Report>;

export type Response = {
  reports: Record<string, Record<string, GroupReport>>;
  summary: string;
  hasDifferences: boolean;
};
