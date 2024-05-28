// @ts-check

import * as z from "zod";

const commonHeaders = {
  accept: "*/*",
  "accept-language": "en-US,en;q=0.8",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-ch-ua": '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Linux"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "sec-gpc": "1",
  "x-requested-with": "XMLHttpRequest",
  cookie: "ASP.NET_SessionId=c3jypdcmmcd2vrf01v4jrdyj",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Referer: "https://catalogo-inet.educacion.gob.ar/buscador-de-instituciones",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/**
 * @param {string} url
 * @param {string} [body]
 */
async function post(url, body) {
  let res;
  try {
    res = await fetch(url, {
      headers: commonHeaders,
      body,
      method: "POST",
    });
  } catch (error) {
    process.stderr.write(`error en ${url} pero reintentamos\n`);
    return await post(url, body);
  }
  if (!res.ok) {
    process.stderr.write(`status ${res.status} en ${url} pero reintentamos\n`);
    return await post(url, body);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(text);
    throw error;
  }
}

const provincias = [
  { Id: 2, Name: "Ciudad de Buenos Aires" },
  { Id: 6, Name: "Buenos Aires" },
  { Id: 10, Name: "Catamarca" },
  { Id: 14, Name: "Córdoba" },
  { Id: 18, Name: "Corrientes" },
  { Id: 22, Name: "Chaco" },
  { Id: 26, Name: "Chubut" },
  { Id: 30, Name: "Entre Ríos" },
  { Id: 34, Name: "Formosa" },
  { Id: 38, Name: "Jujuy" },
  { Id: 42, Name: "La Pampa" },
  { Id: 46, Name: "La Rioja" },
  { Id: 50, Name: "Mendoza" },
  { Id: 54, Name: "Misiones" },
  { Id: 58, Name: "Neuquén" },
  { Id: 62, Name: "Río Negro" },
  { Id: 66, Name: "Salta" },
  { Id: 70, Name: "San Juan" },
  { Id: 74, Name: "San Luis" },
  { Id: 78, Name: "Santa Cruz" },
  { Id: 82, Name: "Santa Fé" },
  { Id: 86, Name: "Santiago del Estero" },
  { Id: 90, Name: "Tucumán" },
  { Id: 94, Name: "Tierra del Fuego" },
];

/**
 *
 * @param {number} juridiccion
 */
async function getDepartamentos(juridiccion) {
  const json = await post(
    `https://catalogo-inet.educacion.gob.ar/jurisdicciones/${juridiccion}/departamentos`
  );
  return z
    .array(
      z.object({
        Id: z.number(),
        Name: z.string(),
      })
    )
    .parse(json);
}

/**
 *
 * @param {number} juridiccion
 * @param {number} departamento
 */
async function getLocalidades(juridiccion, departamento) {
  const json = await post(
    `https://catalogo-inet.educacion.gob.ar/jurisdicciones/${juridiccion}/departamentos/${departamento}`
  );
  return z
    .array(
      z.object({
        Id: z.number(),
        Name: z.string(),
      })
    )
    .parse(json);
}

/**
 * @param {number} juridiccion
 * @param {number} departamento
 * @param {number} localidad
 */
async function getInstituciones(juridiccion, departamento, localidad) {
  const keyVal = {
    draw: "2",
    "columns[0][data]": "Cue",
    "columns[0][name]": "",
    "columns[0][searchable]": "false",
    "columns[0][orderable]": "true",
    "columns[0][search][value]": "",
    "columns[0][search][regex]": "false",
    "columns[1][data]": "Name",
    "columns[1][name]": "",
    "columns[1][searchable]": "false",
    "columns[1][orderable]": "true",
    "columns[1][search][value]": "",
    "columns[1][search][regex]": "false",
    "columns[2][data]": "Management",
    "columns[2][name]": "",
    "columns[2][searchable]": "false",
    "columns[2][orderable]": "true",
    "columns[2][search][value]": "",
    "columns[2][search][regex]": "false",
    "columns[3][data]": "Title",
    "columns[3][name]": "",
    "columns[3][searchable]": "false",
    "columns[3][orderable]": "true",
    "columns[3][search][value]": "",
    "columns[3][search][regex]": "false",
    "columns[4][data]": "Address",
    "columns[4][name]": "",
    "columns[4][searchable]": "false",
    "columns[4][orderable]": "true",
    "columns[4][search][value]": "",
    "columns[4][search][regex]": "false",
    "columns[5][data]": "Id",
    "columns[5][name]": "",
    "columns[5][searchable]": "true",
    "columns[5][orderable]": "true",
    "columns[5][search][value]": "",
    "columns[5][search][regex]": "false",
    "order[0][column]": "1",
    "order[0][dir]": "asc",
    start: "0",
    length: "10000",
    "search[value]": "",
    "search[regex]": "false",
    province: "" + juridiccion,
    department: "" + departamento,
    location: "" + localidad,
    nameOrCue: "",
    address: "",
  };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(keyVal)) {
    params.append(key, value);
  }

  const json = await post(
    "https://catalogo-inet.educacion.gob.ar/listado-instituciones",
    params.toString()
  );
  const res = z
    .object({
      draw: z.string(),
      recordsFiltered: z.number(),
      recordsTotal: z.number(),
      data: z.array(
        z.object({
          Cue: z.string(),
          Id: z.number(),
          Name: z.string(),
          Management: z.string(),
          Title: z.string().nullable(),
          Address: z.string(),
          Email: z.string().nullable(),
          Phone: z.string().nullable(),
          Web: z.string().nullable(),
          Jurisdiction: z.string(),
          Department: z.string(),
          Location: z.string(),
          PostalCode: z.string(),
          Titles: z.string().nullable(),
          Description: z.string().nullable(),
        })
      ),
    })
    .parse(json);

  return res.data;
}

console.log(
  `provincia\tdepartamento\tlocalidad\tcue\tnombre\tmanagement\ttitle\tdireccion\tid\temail\ttelefono\tweb\tjuridiccion\tdepartamento\tlocation\tcodigo_postal\ttitles\tdescripcion`
);

for (const { Id, Name } of provincias) {
  const departamentos = await getDepartamentos(Id);
  const deptos = await Promise.all(
    departamentos.map(async (departamento) => {
      const localidades = await getLocalidades(Id, departamento.Id);
      return {
        id: departamento.Id,
        nombre: departamento.Name,
        localidades: await Promise.all(
          localidades.map(async (localidad) => {
            const instituciones = await getInstituciones(
              Id,
              departamento.Id,
              localidad.Id
            );
            return {
              id: localidad.Id,
              nombre: localidad.Name,
              instituciones,
            };
          })
        ),
      };
    })
  );
  console.log(
    deptos
      .map((depto) =>
        depto.localidades
          .map((local) =>
            local.instituciones
              .map(
                (inst) =>
                  `${Name}\t${depto.nombre}\t${local.nombre}\t${
                    inst.Cue
                  }\t${inst.Name.trim().replaceAll("\t", " ")}\t${
                    inst.Management
                  }\t${inst.Title}\t${inst.Address}\t${inst.Id}\t${
                    inst.Email
                  }\t${inst.Phone}\t${inst.Web}\t${inst.Jurisdiction}\t${
                    inst.Department
                  }\t${inst.Location}\t${inst.PostalCode}\t${inst.Titles}\t${
                    inst.Description
                  }`
              )
              .join("\n")
          )
          .join("\n")
      )
      .join("\n")
  );
}
