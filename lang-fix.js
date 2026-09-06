(function(){

  "use strict";

  const KEY="quoteflow_lang_v1";

  const EN={

    "Proyecto y cliente":"Project & Customer",

    "Cliente":"Client",

    "Tu empresa":"Your company",

    "Dirección del trabajo":"Job address",

    "Elegir especialidad":"Choose trade",

    "Precios":"Pricing",

    "Partidas personalizadas":"Custom line items",

    "Gastos generales":"Overhead",

    "Ganancia":"Profit",

    "Impuesto":"Tax",

    "Descuento":"Discount",

    "Resumen de cotización":"Quote Summary",

    "Costo estimado":"Estimated cost",

    "Precio recomendado al cliente":"Recommended customer price",

    "Margen bruto proyectado":"Projected gross margin",

    "Bueno":"Good",

    "Mejor":"Better",

    "Óptimo":"Best",

    "Vista del cliente":"Customer Preview",

    "Cotización profesional":"Professional Quote",

    "Generar cotización":"Generate Quote",

    "Limpiar":"Clear",

    "Guardar cotización":"Save Quote",

    "Compartir cotización":"Share Quote",

    "Cotización":"Quote",

    "Partida":"Item",

    "Descripción":"Description",

    "Resultado esperado":"Expected Result",

    "Monto $":"Amount $",

    "Gastos generales %":"Overhead %",

    "Ganancia / margen %":"Profit / markup %",

    "Impuesto de venta %":"Sales tax %",

    "Aún no hay cotizaciones guardadas.":"No saved quotes yet.",

    "Cargar":"Load",

    "Herramientas":"Job Tools",

    "Cotizaciones guardadas":"Saved Quotes",

    "Idioma":"Language",

    "Techo instalado o reparado, sellado y terminado según el alcance.":"Roof installed or repaired, sealed and completed according to scope."

  };

  const ES=Object.fromEntries(

    Object.entries(EN).map(([a,b])=>[b,a])

  );

  const MOJI={

    "CotizaciÃ³n":"Cotización",

    "cotizaciÃ³n":"cotización",

    "DescripciÃ³n":"Descripción",

    "DirecciÃ³n":"Dirección",

    "GanancÃ­a":"Ganancia",

    "Impuesto":"Impuesto",

    "Â¿":"¿",

    "Ã":"Á",

    "Ã³":"ó",

    "Ãº":"ú",

    "Ã­":"í",

    "Ã±":"ñ",

    "â":"←",

    "â":"—"

  };

  function getLang(){

    try{

      return localStorage.getItem(KEY)||"en";

    }catch{

      return "en";

    }

  }

  function fixText(s){

    let out=s;

    for(const [a,b] of Object.entries(MOJI)){

      out=out.split(a).join(b);

    }

    return out;

  }

  function walk(root){

    const l=getLang();

    const map=l==="es"?ES:EN;

    const w=document.createTreeWalker(

      root,

      NodeFilter.SHOW_TEXT

    );

    let n;

    while(n=w.nextNode()){

      let v=fixText(n.nodeValue);

      for(const [a,b] of Object.entries(map)){

        if(v.includes(a)){

          v=v.split(a).join(b);

        }

      }

      if(v!==n.nodeValue){

        n.nodeValue=v;

      }

    }

    if(root.querySelectorAll){

      root.querySelectorAll(

        "input[placeholder],textarea[placeholder]"

      ).forEach(e=>{

        let v=fixText(e.placeholder);

        for(const [a,b] of Object.entries(map)){

          v=v.split(a).join(b);

        }

        e.placeholder=v;

      });

    }

  }

  let busy=false;

  function run(){

    if(busy)return;

    busy=true;

    requestAnimationFrame(()=>{

      busy=false;

      walk(document.body);

    });

  }

  new MutationObserver(run).observe(

    document.documentElement,

    {

      childList:true,

      subtree:true,

      characterData:true

    }

  );

  setInterval(run,500);

  if(document.readyState==="loading"){

    document.addEventListener("DOMContentLoaded",run);

  }else{

    run();

  }

})();
