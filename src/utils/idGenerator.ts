export function generatePluginId(): string {
  const timestamp = Date.now().toString();
  const uuid = generateUUIDv4();
  return `${timestamp}_${uuid}`;
}

function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function validatePluginId(id: string): boolean {
  const pattern = /^([0-9]{13})_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  const match = id.match(pattern);
  
  if (!match) {
    return false;
  }

  const timestamp = parseInt(match[1]);
  const minTimestamp = 1749401460000;

  return timestamp >= minTimestamp;
}
