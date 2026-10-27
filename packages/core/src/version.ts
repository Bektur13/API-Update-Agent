export function getMajorVersion(range: string): number | null {
    const version = range.match(/\d+/);
    if(version) {
        const majorVersion : number = parseInt(version[0], 10);
        return majorVersion;
    }else if(version == "latest") {
        return null
    }else {
        return null;
    }
}