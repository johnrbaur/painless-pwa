
// XXX: Temporary stupid template processor, to be replaced with
// something way better and smarter.

export function processTemplate(template: string, obj: any): string {

  let s: string = template || '';

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    s = s.replace(
      new RegExp('{{\\s*' + key + '\\s*}}', 'g'),
      value
    );
  });

  return s;
}

