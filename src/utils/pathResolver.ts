/** remove the leading and trailing '/' in a path */
export function pathResolver(path: string): string {
    return path.replace(/^\/+|\/+$/g, '');
  }