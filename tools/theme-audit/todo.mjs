// node todo.mjs <outdir> : prints layout problems grouped per route
import fs from "node:fs";
const l = JSON.parse(fs.readFileSync(process.argv[2] + "/layout.json", "utf8"));
for (const x of l) {
  const bits = [];
  if (x.error) bits.push("ERR " + x.error);
  if (x.hOverflow) bits.push(`H-OVERFLOW sw=${x.scrollWidth}/${x.innerWidth}`);
  if (x.offscreen?.length) bits.push("OFF " + x.offscreen.slice(0, 4).map((o) => `${o.selector}[${o.left},${o.right}]`).join(" ; "));
  if (x.cutoff?.filter((o) => !/sidebar-container|ant-tabs-nav-wrap/.test(o.by)).length) bits.push("CUT " + x.cutoff.filter((o) => !/sidebar-container|ant-tabs-nav-wrap/.test(o.by)).slice(0, 6).map((o) => `${o.selector} by ${o.by} +${o.over} "${o.text}"`).join(" ; "));
  if (x.clipped?.filter((o) => !/ant-tabs-nav-wrap/.test(o.selector)).length) bits.push("CLIP " + x.clipped.filter((o) => !/ant-tabs-nav-wrap/.test(o.selector)).slice(0, 4).map((o) => `${o.selector} ${o.sw}>${o.cw}`).join(" ; "));
  if (bits.length) console.log(`## ${x.route.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, "<id>")} @${x.vp} ${x.theme}\n   ` + bits.join("\n   "));
}
