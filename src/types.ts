export type Args = {
  branchPath: string;
  path: string;
  onlyDiff: boolean;
};

export type Report = Record<
  string,
  {
    bundled?: number;
    minified?: number;
    gzipped?: number;
  }
>;

export type SingleResponse = {
  oldReport?: Report;
  newReport?: Report;
  summary?: string;
};

export type Response = {
  reports: Record<string, SingleResponse>;
  summary?: string;
};
