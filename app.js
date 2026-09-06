// QuoteFlow Beta - Enhanced bilingual quotes, item descriptions/results,
// professional PDF printing, charts, saving and native sharing.
(function () {
  "use strict";

  const KEY = "quoteflow_quotes_v1";
  const LANG_KEY = "quoteflow_lang_v1";
  let printOpenedProfessional = false;

  const T = {
    en: {
      save: "Save Quote", share: "Share Quote", print: "Print / PDF",
      item: "Item", description: "Description", result: "Expected Result", amount: "Amount $",
      addItem: "+ Add item", itemDesc: "What will be done?", itemResult: "What will the customer receive?",
      saved: "Quote saved on this device.", copied: "Quote information copied to clipboard.",
      quote: "QUOTE", prepared: "Prepared For", scope: "Scope of Work", lineItems: "Work Items",
      payment: "Payment Terms", valid: "Valid Until", warranty: "Warranty", notes: "Notes / Exclusions",
      contractor: "Contractor Signature", customerSig: "Customer Acceptance / Signature",
      materials: "Materials", labor: "Labor", other: "Other", cost: "Cost", profit: "Profit", margin: "Margin",
      breakdown: "Cost Breakdown", health: "Quote Health", resultSummary: "Project Results",
      language: "Language", estimate: "Estimate", preview: "Customer Preview", tools: "Job Tools", savedQuotes: "Saved Quotes",
      projectCustomer: "Project & Customer", client: "Client", company: "Your company", address: "Job address",
      chooseTrade: "Choose trade", pricing: "Pricing", customItems: "Custom line items", overhead: "Overhead %",
      profitMarkup: "Profit / markup %", tax: "Sales tax %", discount: "Discount $", summary: "Quote Summary",
      estimatedCost: "Estimated cost", recommended: "Recommended customer price", projectedMargin: "Projected gross margin",
      good: "Good", better: "Better", best: "Best", professionalQuote: "Professional Quote",
      buildProposal: "Build a client-ready proposal from the current estimate.", generate: "Generate Quote", save: "Save Quote",
      clear: "Clear", back: "â Back", smart: "Smart Scope Assistant", daily: "Daily Job Log", changeOrders: "Change Orders",
      noSaved: "No saved quotes yet.", load: "Load", customer: "Customer", project: "Project",
      verify: "Verify quantities, supplier prices, labor, permits, taxes and site conditions before sending.",
      construction: "Professional construction services as described in the project scope.",
      generatedResult: "Completed according to the agreed scope, quantities, specifications and site requirements."
    },
    es: {
      save: "Guardar cotizaciÃ³n", share: "Compartir cotizaciÃ³n", print: "Imprimir / PDF",
      item: "Partida", description: "DescripciÃ³n", result: "Resultado esperado", amount: "Monto $",
      addItem: "+ Agregar partida", itemDesc: "Â¿QuÃ© trabajo se realizarÃ¡?", itemResult: "Â¿QuÃ© recibirÃ¡ el cliente?",
      saved: "CotizaciÃ³n guardada en este dispositivo.", copied: "InformaciÃ³n de la cotizaciÃ³n copiada al portapapeles.",
      quote: "COTIZACIÃN", prepared: "Preparada para", scope: "Alcance del trabajo", lineItems: "Partidas del trabajo",
      payment: "Condiciones de pago", valid: "VÃ¡lida hasta", warranty: "GarantÃ­a", notes: "Notas / exclusiones",
      contractor: "Firma del contratista", customerSig: "AceptaciÃ³n / firma del cliente",
      materials: "Materiales", labor: "Mano de obra", other: "Otros", cost: "Costo", profit: "Ganancia", margin: "Margen",
      breakdown: "Desglose de costos", health: "Salud de la cotizaciÃ³n", resultSummary: "Resultados del proyecto",
      language: "Idioma", estimate: "CotizaciÃ³n", preview: "Vista del cliente", tools: "Herramientas", savedQuotes: "Cotizaciones guardadas",
      projectCustomer: "Proyecto y cliente", client: "Cliente", company: "Tu empresa", address: "DirecciÃ³n del trabajo",
      chooseTrade: "Elegir oficio", pricing: "Precios", customItems: "Partidas personalizadas", overhead: "Gastos generales %",
      profitMarkup: "Ganancia / margen %", tax: "Impuesto de venta %", discount: "Descuento $", summary: "Resumen de cotizaciÃ³n",
      estimatedCost: "Costo estimado", recommended: "Precio recomendado al cliente", projectedMargin: "Margen bruto proyectado",
      good: "Bueno", better: "Mejor", best: "Ãptimo", professionalQuote: "CotizaciÃ³n profesional",
      buildProposal: "Crea una propuesta profesional lista para el cliente desde la cotizaciÃ³n actual.", generate: "Generar cotizaciÃ³n", clear: "Limpiar",
      back: "â Regresar", smart: "Asistente inteligente de alcance", daily: "Registro diario", changeOrders: "Ãrdenes de cambio",
      noSaved: "AÃºn no hay cotizaciones guardadas.", load: "Cargar", customer: "Cliente", project: "Proyecto",
      verify: "Verifica cantidades, precios de proveedores, mano de obra, permisos, impuestos y condiciones del sitio antes de enviar.",
      construction: "Servicios profesionales de construcciÃ³n segÃºn el alcance del proyecto.",
      generatedResult: "Trabajo completado de acuerdo con el alcance, cantidades, especificaciones y condiciones del sitio acordadas."
    }
  };

  function currentLang() {
    try { return localStorage.getItem(LANG_KEY) || (typeof lang !== "undefined" ? lang : "en"); } catch { return (typeof lang !== "undefined" ? lang : "en"); }
  }
  function tr(k) { return (T[currentLang()] || T.en)[k] || k; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function money(n) {
    return "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function getQuotes() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function saveQuotes(q) { localStorage.setItem(KEY, JSON.stringify(q)); }
  function quoteNumber() {
    const d = new Date();
    return "QF-" + d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0") + "-" + String(Date.now()).slice(-4);
  }

  function normalizeItems() {
    if (!Array.isArray(items)) return;
    items.forEach(x => {
      if (typeof x.description !== "string") x.description = "";
      if (typeof x.result !== "string") x.result = "";
      if (typeof x.amount !== "number") x.amount = Number(x.amount) || 0;
    });
  }

  function defaultItemResult() {
    const tradeKey = (typeof trade !== "undefined" ? trade : "general");
    const map = {
      roof: currentLang()==="es" ? "Techo instalado o reparado, sellado y terminado segÃºn el alcance." : "Roof installed or repaired, sealed and completed according to scope.",
      concrete: currentLang()==="es" ? "Superficie de concreto preparada, colocada y terminada segÃºn especificaciones." : "Concrete surface prepared, placed and finished according to specifications.",
      siding: currentLang()==="es" ? "Revestimiento instalado y terminado con un acabado uniforme y protegido." : "Siding installed and finished with a uniform, protected appearance.",
      gutters: currentLang()==="es" ? "Canaletas instaladas y funcionando correctamente para dirigir el agua." : "Gutters installed and functioning properly to direct water.",
      painting: currentLang()==="es" ? "Superficies preparadas y pintadas con acabado uniforme." : "Surfaces prepared and painted with a uniform finish.",
      drywall: currentLang()==="es" ? "Paneles instalados, encintados, afinados y listos para acabado." : "Panels installed, taped, finished and ready for final coating.",
      flooring: currentLang()==="es" ? "Piso instalado, nivelado y terminado segÃºn el material seleccionado." : "Flooring installed, leveled and finished according to the selected material.",
      landscaping: currentLang()==="es" ? "Ãrea preparada y terminada conforme al diseÃ±o y alcance acordados." : "Area prepared and completed according to the agreed design and scope.",
      excavation: currentLang()==="es" ? "ExcavaciÃ³n y preparaciÃ³n del terreno completadas a las dimensiones acordadas." : "Excavation and site preparation completed to the agreed dimensions.",
      framing: currentLang()==="es" ? "Estructura instalada y alineada conforme a los planos y especificaciones." : "Framing installed and aligned according to plans and specifications.",
      remodel: currentLang()==="es" ? "Ãrea remodelada y terminada conforme al alcance acordado." : "Area remodeled and completed according to the agreed scope.",
      general: tr("generatedResult")
    };
    return map[tradeKey] || tr("generatedResult");
  }

  function renderEnhancedItems() {
    if (!document.getElementById || !$("items")) return;
    normalizeItems();
    $("items").innerHTML = (items || []).map((x,i) => `
      <div class="item qf-item-enhanced">
        <div class="qf-item-head"><strong>${esc(tr("item"))} ${i+1}</strong></div>
        <div class="fields">
          <div class="field full">
            <label>${esc(tr("description"))}</label>
            <input placeholder="${esc(tr("itemDesc"))}" value="${esc(x.description)}" oninput="items[${i}].description=this.value;calc()">
          </div>
          <div class="field full">
            <label>${esc(tr("result"))}</label>
            <textarea rows="2" placeholder="${esc(tr("itemResult"))}" oninput="items[${i}].result=this.value;calc()">${esc(x.result)}</textarea>
          </div>
          <div class="field">
            <label>${esc(tr("amount"))}</label>
            <input type="number" value="${Number(x.amount)||0}" oninput="items[${i}].amount=Number(this.value)||0;calc()">
          </div>
          <div class="field" style="display:flex;align-items:end">
            <button type="button" class="btn" onclick="items.splice(${i},1);renderItems();calc()">${currentLang()==="es" ? "Eliminar" : "Remove"}</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  function enhanceAddItem() {
    if (typeof window.addItem !== "function" || window.addItem.__qfEnhanced) return;
    const original = window.addItem;
    const enhanced = function () {
      original();
      normalizeItems();
      const x = items[items.length - 1];
      if (x) x.result = defaultItemResult();
      renderEnhancedItems();
      if (typeof window.calc === "function") window.calc();
    };
    enhanced.__qfEnhanced = true;
    window.addItem = enhanced;
    window.renderItems = renderEnhancedItems;
    renderEnhancedItems();
  }

  function buildProfessionalLineItems() {
    normalizeItems();
    const arr = (items || []).filter(x => (x.description || x.result || Number(x.amount)));
    if (!arr.length) {
      const tradeObj = (trades || []).find(x => x[0] === (typeof trade !== "undefined" ? trade : "general"));
      return [{ description: tradeObj ? tradeObj[lang === "es" ? 3 : 2] + (lang === "es" ? " - servicios de construcciÃ³n" : " construction services") : "Construction services", result: defaultItemResult(), amount: (typeof window.qTotal === "function" ? window.qTotal() : 0) }];
    }
    return arr;
  }

  function generateProfessionalQuoteEnhanced() {
    if (typeof window.generateProfessionalQuote === "function" && !window.generateProfessionalQuote.__qfOriginal) {
      // Mark and call the original once after we prepare the fields.
      window.generateProfessionalQuote.__qfOriginal = true;
    }
    const company = $("companyName")?.value.trim() || $("company")?.value.trim() || (currentLang()==="es" ? "Tu Empresa de ConstrucciÃ³n" : "Your Construction Company");
    const customer = $("quoteCustomer")?.value.trim() || $("client")?.value.trim() || tr("customer");
    const address = $("quoteAddress")?.value.trim() || $("address")?.value.trim() || (currentLang()==="es" ? "DirecciÃ³n del proyecto" : "Project Address");
    const total = typeof window.qTotal === "function" ? window.qTotal() : 0;
    const qn = $("quoteNumber")?.value || quoteNumber();
    if ($("quoteNumber")) $("quoteNumber").value = qn;
    const desc = $("quoteDesc")?.value.trim() || (currentLang()==="es" ? "Servicios profesionales de construcciÃ³n segÃºn el alcance del proyecto." : "Professional construction services as described in the project scope.");
    const terms = $("quoteTerms")?.value || "";
    const valid = $("quoteValid")?.value || "â";
    const warranty = $("quoteWarranty")?.value.trim() || "";
    const notes = $("quoteNotes")?.value.trim() || "";
    const items = buildProfessionalLineItems();
    const itemRows = items.map((x,i)=>`<tr><td><strong>${esc(x.description || tr("item")+" "+(i+1))}</strong>${x.result ? `<div class="qf-print-result"><b>${esc(tr("result"))}:</b> ${esc(x.result)}</div>` : ""}</td><td style="text-align:right;white-space:nowrap">${money(x.amount)}</td></tr>`).join("");
    $("professionalPreview").innerHTML = `
      <div class="quoteHeader"><div><div class="quoteBrand">${esc(company)}</div><div class="quoteMeta">${esc(address)}</div></div><div class="quoteTitle"><h1>${esc(tr("quote"))}</h1><div class="quoteMeta">${esc(qn)} Â· ${new Date().toLocaleDateString()}</div></div></div>
      <div class="quoteSection"><b>${esc(tr("prepared"))}</b><br>${esc(customer)}<br>${esc(address)}</div>
      <div class="quoteSection"><b>${esc(tr("scope"))}</b><br>${esc(desc)}</div>
      <div class="quoteSection"><b>${esc(tr("lineItems"))}</b><table class="quoteTable"><tr><th>${esc(tr("description"))}</th><th>${esc(tr("amount"))}</th></tr>${itemRows}</table></div>
      <div class="quoteTotals"><div><span>${esc(tr("estimatedCost"))}</span><b>${money(total)}</b></div><div class="quoteGrand"><span>Total</span><b>${money(total)}</b></div></div>
      <div class="quoteSection"><b>${esc(tr("payment"))}:</b> ${esc(terms)}<br><b>${esc(tr("valid"))}:</b> ${esc(valid)}</div>
      ${warranty ? `<div class="quoteSection"><b>${esc(tr("warranty"))}:</b><br>${esc(warranty)}</div>` : ""}
      ${notes ? `<div class="quoteSection"><b>${esc(tr("notes"))}:</b><br>${esc(notes)}</div>` : ""}
      <div class="quoteSign"><div><div class="signLine"></div><small>${esc(tr("contractor"))}</small></div><div><div class="signLine"></div><small>${esc(tr("customerSig"))}</small></div></div>`;
  }

  function prepareProfessionalPrint() {
    const pro = $("proQuote");
    if (!pro) return;
    if (typeof window.openProfessionalQuote === "function") window.openProfessionalQuote();
    pro.classList.remove("hidden");
    if ($("quoteNumber") && !$('quoteNumber').value) $("quoteNumber").value = quoteNumber();
    generateProfessionalQuoteEnhanced();
    printOpenedProfessional = true;
  }

  function injectEnhancementCSS() {
    if ($("qf-enhancement-style")) return;
    const s = document.createElement("style");
    s.id = "qf-enhancement-style";
    s.textContent = `
      .qf-item-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#dfe5ee}
      .qf-item-enhanced textarea{min-height:65px}
      .qf-print-result{font-size:12px;color:#667085;margin-top:5px;line-height:1.45}
      .qf-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      @page{size:Letter portrait;margin:.45in}
      @media print{
        html,body{background:#fff!important;color:#151922!important;margin:0!important;padding:0!important;width:100%!important;height:auto!important}
        body>.app>*:not(#proQuote){display:none!important}
        #proQuote{display:block!important;visibility:visible!important;position:static!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:#fff!important;box-shadow:none!important;color:#151922!important}
        #proQuote>h2,#proQuote>p.small,#proQuote>.fields,#proQuote>textarea,#proQuote>.actions{display:none!important}
        #professionalPreview{display:block!important;visibility:visible!important;background:#fff!important;color:#151922!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important}
        #professionalPreview *{visibility:visible!important}
        .quotePaper{margin:0!important;padding:0!important;min-height:0!important;border-radius:0!important;box-shadow:none!important}
        .quoteTable tr,.quoteSection,.quoteSign{break-inside:avoid;page-break-inside:avoid}
      }
    `;
    document.head.appendChild(s);
  }

  function translateStaticUI() {
    const isES = currentLang() === "es";
    const text = {
      "#estimate > main h2": tr("projectCustomer"),
      ".summary h2": tr("summary"),
      "#estimate > main h3:nth-of-type(1)": tr("chooseTrade"),
      "#estimate > main h3:nth-of-type(2)": tr("pricing"),
      "#estimate > main h3:nth-of-type(3)": tr("customItems"),
      "#preview .actions .btn": tr("back"),
      "#tools main h2": tr("smart"),
      "#tools aside h2": tr("daily"),
      "#saved h2": tr("savedQuotes"),
      "#proQuote h2": tr("professionalQuote"),
      "#proQuote>p.small": tr("buildProposal"),
      "#qfVisualDashboard .qf-card:first-child h3": "ð " + tr("breakdown"),
      "#qfVisualDashboard .qf-card:nth-child(2) h3": "ð° " + tr("health"),
      "#qfVisualDashboard .qf-kpi:nth-child(1)": tr("cost"),
      "#qfVisualDashboard .qf-kpi:nth-child(2)": tr("profit"),
      "#qfVisualDashboard .qf-kpi:nth-child(3)": tr("margin")
    };
    Object.entries(text).forEach(([sel,val])=>{ const el=document.querySelector(sel); if(el) { if(sel.includes("qf-kpi")) { const b=el.querySelector("b"); el.firstChild.textContent=val+" "; if(b) el.appendChild(b); } else el.textContent=val; }});
    const tabs=document.querySelectorAll(".tabs .tab");
    [tr("estimate"),tr("preview"),tr("tools"),tr("savedQuotes")].forEach((v,i)=>{if(tabs[i])tabs[i].textContent=v;});
    const labels={client:tr("client"),company:tr("company"),address:tr("address"),over:tr("overhead"),profit:tr("profitMarkup"),tax:tr("tax"),discount:tr("discount")};
    Object.entries(labels).forEach(([id,v])=>{const el=$(id);if(el&&el.previousElementSibling)el.previousElementSibling.textContent=v;});
    const buttons=[...document.querySelectorAll("button")];
    buttons.forEach(b=>{
      const t=b.textContent.trim();
      if(t==="+ Add item"||t==="+ Agregar partida")b.textContent=tr("addItem");
      if(t==="Save quote"||t==="Guardar cotizaciÃ³n")b.textContent=tr("save");
      if(t==="Print / PDF")b.textContent=tr("print");
      if(t==="Professional Quote")b.textContent=tr("professionalQuote");
      if(t==="Clear")b.textContent=tr("clear");
    });
    const verify=document.querySelector(".summary p.small:last-child"); if(verify)verify.textContent=tr("verify");
    if($('hero')) $('hero').textContent=isES?'Cotiza mÃ¡s rÃ¡pido. Protege tu ganancia.':'Estimate faster. Protect your profit.';
    if($('heroSub')) $('heroSub').textContent=isES?'Un espacio sencillo para cotizaciones de contratistas.':'One simple quoting workspace for construction contractors.';
    renderEnhancedItems();
  }

  function updateEnhancedDashboard() {
    try {
      const get = id => Number(document.getElementById(id)?.value || 0);
      let mat = 0, lab = 0, other = 0;
      const t = typeof trade !== "undefined" ? trade : "general";
      if (t === "roof") {
        const area = get("roofArea"), waste = 1 + get("roofWaste") / 100;
        mat = area * waste * get("roofMaterial") + get("roofAccessories");
        lab = area * get("roofLabor") + area * get("roofTear");
        other = get("roofDisposal");
      } else if (t === "concrete") {
        const l=get("length"), w=get("width"), th=get("thickness");
        const exact=(l*w*(th/12))/27;
        const order=Math.ceil((exact*(1+get("waste")/100))*4)/4;
        mat=order*get("concretePrice")+get("rebar");
        lab=get("concreteLabor");
        other=get("baseExc")+get("delivery");
      } else {
        mat=get("materials");
        lab=get("labor");
        other=get("equipment")+get("subcontractor")+get("siteMisc");
      }
      (items || []).forEach(x => { other += Number(x.amount)||0; });
      const total=mat+lab+other;
      const max=Math.max(mat,lab,other,1);
      [["barMat",mat],["barLab",lab],["barOther",other]].forEach(([id,v])=>{const e=$(id);if(e)e.style.width=Math.min(100,v/max*100)+"%";});
      [["dashMat",mat],["dashLab",lab],["dashOther",other]].forEach(([id,v])=>{const e=$(id);if(e)e.textContent=money(v);});
      if($("dashCost"))$("dashCost").textContent=money(total);
      const p=get("profit"); const profit=total*p/100;
      if($("dashProfit"))$("dashProfit").textContent=money(profit);
      if($("dashMargin"))$("dashMargin").textContent=(total?profit/Math.max(total+profit,1)*100:0).toFixed(1)+"%";
    } catch(e) {}
  }

  function translateDynamicLabels() {
    const es=currentLang()==="es";
    const map = es ? {
      roofArea:"Ãrea del techo (cuadros)", roofWaste:"Desperdicio %", roofMaterial:"Material $ / cuadro", roofTear:"Retiro $ / cuadro", roofLabor:"Mano de obra $ / cuadro", roofAccessories:"Accesorios", roofDisposal:"Desecho",
      length:"Largo (pies)", width:"Ancho (pies)", thickness:"Espesor (pulg)", waste:"Desperdicio %", concretePrice:"Concreto $ / ydÂ³", concreteLabor:"Mano de obra", rebar:"Varilla / moldes", baseExc:"Base / excavaciÃ³n", delivery:"Entrega",
      materials:"Materiales", labor:"Mano de obra", equipment:"Equipo", subcontractor:"Subcontratista", siteMisc:"Sitio / varios"
    } : {
      roofArea:"Roof area (squares)", roofWaste:"Waste %", roofMaterial:"Material $ / square", roofTear:"Tear-off $ / square", roofLabor:"Install labor $ / square", roofAccessories:"Accessories", roofDisposal:"Disposal",
      length:"Length (ft)", width:"Width (ft)", thickness:"Thickness (in)", waste:"Waste %", concretePrice:"Concrete $ / ydÂ³", concreteLabor:"Labor", rebar:"Rebar / Forms", baseExc:"Base / Excavation", delivery:"Delivery",
      materials:"Materials", labor:"Labor", equipment:"Equipment", subcontractor:"Subcontractor", siteMisc:"Site / Misc"
    };
    Object.entries(map).forEach(([id,label])=>{const el=$(id);if(el&&el.parentElement?.querySelector("label"))el.parentElement.querySelector("label").textContent=label;});
    const h3=document.querySelector("#dynamic h3"); if(h3){const names={roof:es?"Techo":"Roofing",concrete:es?"Calculadora de concreto":"Concrete Calculator"}; if(names[trade])h3.textContent=names[trade];}
  }

  function buildShareCanvas() {
    normalizeItems();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const W = 1200;
    const rows = buildProfessionalLineItems();
    const lineH = 34;
    const itemExtra = rows.reduce((n, x) => n + 90 + Math.ceil(String(x.result || "").length / 85) * 24, 0);
    const H = Math.max(1500, 720 + itemExtra);
    canvas.width = W; canvas.height = H;

    ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = "#151922";
    ctx.font = "700 42px Arial";
    const company = $("companyName")?.value.trim() || $("company")?.value.trim() || (currentLang()==="es" ? "Tu Empresa de ConstrucciÃ³n" : "Your Construction Company");
    ctx.fillText(company.slice(0, 38), 70, 82);
    ctx.font = "700 52px Arial"; ctx.textAlign = "right"; ctx.fillText(tr("quote"), W-70, 82);
    ctx.font = "24px Arial"; ctx.fillStyle = "#667085"; ctx.fillText($("quoteNumber")?.value || quoteNumber(), W-70, 122);
    ctx.textAlign = "left";

    let y = 175;
    ctx.strokeStyle = "#d9dee7"; ctx.beginPath(); ctx.moveTo(70,y); ctx.lineTo(W-70,y); ctx.stroke(); y += 58;
    const customer = $("quoteCustomer")?.value.trim() || $("client")?.value.trim() || tr("customer");
    const address = $("quoteAddress")?.value.trim() || $("address")?.value.trim() || (currentLang()==="es" ? "DirecciÃ³n del proyecto" : "Project Address");
    const desc = $("quoteDesc")?.value.trim() || tr("construction");
    ctx.fillStyle = "#151922"; ctx.font = "700 25px Arial"; ctx.fillText(tr("prepared")+":",70,y);
    ctx.font = "25px Arial"; ctx.fillText(customer.slice(0,55), 270, y); y += 38;
    ctx.fillText(address.slice(0,70), 270, y); y += 58;
    ctx.font = "700 25px Arial"; ctx.fillText(tr("scope")+":",70,y); y += 36;
    ctx.font = "24px Arial"; y = drawWrapped(ctx, desc, 70, y, W-140, 34, 3) + 24;

    ctx.fillStyle = "#151922"; ctx.font = "700 28px Arial"; ctx.fillText(tr("lineItems"),70,y); y += 42;
    rows.forEach((x,i)=>{
      ctx.fillStyle = "#f4f6f8"; ctx.fillRect(70,y-28,W-140, Math.max(120, 90 + Math.ceil(String(x.result||"").length/85)*24));
      ctx.fillStyle = "#151922"; ctx.font = "700 25px Arial";
      ctx.fillText((i+1)+". "+String(x.description || tr("item")+" "+(i+1)).slice(0,75), 95, y+5);
      ctx.textAlign = "right"; ctx.font = "700 25px Arial"; ctx.fillText(money(x.amount), W-95, y+5); ctx.textAlign = "left";
      y += 40;
      ctx.font = "700 21px Arial"; ctx.fillStyle = "#667085"; ctx.fillText(tr("result")+":", 95, y); y += 28;
      ctx.font = "21px Arial"; ctx.fillStyle = "#344054";
      y = drawWrapped(ctx, String(x.result || "â"), 95, y, W-190, 28, 4) + 30;
    });

    const total = typeof window.qTotal === "function" ? window.qTotal() : 0;
    y += 10; ctx.strokeStyle="#d9dee7"; ctx.beginPath(); ctx.moveTo(70,y); ctx.lineTo(W-70,y); ctx.stroke(); y += 58;
    ctx.font="700 30px Arial"; ctx.fillStyle="#151922"; ctx.fillText("Total", 70, y);
    ctx.textAlign="right"; ctx.font="700 42px Arial"; ctx.fillText(money(total), W-70, y); ctx.textAlign="left";
    y += 70;
    ctx.font="20px Arial"; ctx.fillStyle="#667085";
    y = drawWrapped(ctx, tr("verify"), 70, y, W-140, 28, 4) + 35;
    ctx.font="18px Arial"; ctx.fillText("QuoteFlow â¢ "+new Date().toLocaleDateString(),70,y);
    return canvas;
  }

  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = String(text || "").split(/\s+/); let line="", lines=0;
    for (let n=0;n<words.length;n++) {
      const test=line ? line+" "+words[n] : words[n];
      if(ctx.measureText(test).width>maxWidth && line){ ctx.fillText(line,x,y); y+=lineHeight; lines++; line=words[n]; if(lines>=maxLines){ line += "â¦"; break; } }
      else line=test;
    }
    if(line && lines<maxLines){ ctx.fillText(line,x,y); y+=lineHeight; lines++; }
    return y;
  }

  async function canvasToFile(canvas, filename) {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png", 1));
    if (!blob) throw new Error("PNG generation failed");
    return new File([blob], filename, {type:"image/png"});
  }

  function enhanceSharing() {
    window.quoteFlowShare = async function () {
      prepareProfessionalPrint();
      const quoteId = $("quoteNumber")?.value || quoteNumber();
      const customer = $("quoteCustomer")?.value || $("client")?.value || tr("customer");
      const total = typeof window.qTotal === "function" ? money(window.qTotal()) : money(0);
      const text = `QuoteFlow Construction\n${tr("quote")}: ${quoteId}\n${tr("customer")}: ${customer}\nTotal: ${total}`;
      try {
        const canvas = buildShareCanvas();
        const file = await canvasToFile(canvas, `QuoteFlow-${quoteId}.png`);
        const shareData = { title: `QuoteFlow ${quoteId}`, text, files: [file] };
        if (navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))) {
          await navigator.share(shareData);
          return;
        }
        if (navigator.share) {
          await navigator.share({title:shareData.title,text});
          return;
        }
        const url = URL.createObjectURL(file);
        const a=document.createElement("a"); a.href=url; a.download=file.name; a.click();
        setTimeout(()=>URL.revokeObjectURL(url),5000);
        alert(currentLang()==="es" ? "La cotizaciÃ³n se preparÃ³ como imagen PNG. Ãbrela y usa Compartir para enviarla." : "The quote was prepared as a PNG image. Open it and use Share to send it.");
      } catch (e) {
        if (e && e.name === "AbortError") return;
        try { if (navigator.clipboard) await navigator.clipboard.writeText(text); } catch {}
        alert(currentLang()==="es" ? "No se pudo compartir el archivo. Se dejÃ³ la informaciÃ³n disponible para copiar." : "The file could not be shared. The quote information is available to copy.");
      }
    };
  }

  window.quoteFlowSave = function () {
    const fields = document.querySelectorAll("input, textarea, select");
    const data = {};
    fields.forEach((field,i)=>{
      if(field.type==="button"||field.type==="submit")return;
      data[field.id||field.name||field.placeholder||"field_"+i]=field.value;
    });
    normalizeItems();
    const quote={id:quoteNumber(),created:new Date().toISOString(),data,items:JSON.parse(JSON.stringify(items||[]))};
    const quotes=getQuotes();quotes.unshift(quote);saveQuotes(quotes);
    alert(tr("saved")+"\n"+quote.id);return quote;
  };
  window.quoteFlowQuotes=()=>getQuotes();
  window.quoteFlowPrint=function(){prepareProfessionalPrint();setTimeout(()=>window.print(),120);};

  function addToolbar(){
    if($("qf-beta-toolbar"))return;
    const bar=document.createElement("div");bar.id="qf-beta-toolbar";bar.className="qf-toolbar no-print";
    bar.innerHTML=`<button type="button" class="btn" onclick="quoteFlowSave()">ð¾ ${esc(tr("save"))}</button><button type="button" class="btn primary" onclick="quoteFlowShare()">ð¤ ${esc(tr("share"))}</button><button type="button" class="btn" onclick="quoteFlowPrint()">ð§¾ ${esc(tr("print"))}</button>`;
    const target=document.querySelector("main")||document.querySelector(".container")||document.body.firstElementChild||document.body;target.prepend(bar);
  }

  // Wrap the existing language switch so all enhanced UI updates with it.
  function enhanceLanguage(){
    if(typeof window.setLang!=="function"||window.setLang.__qfEnhanced)return;
    const original=window.setLang;
    const enhanced=function(x){
      try{localStorage.setItem(LANG_KEY,x);}catch{}
      original(x);
      translateStaticUI();
      renderEnhancedItems();
      generateProfessionalQuoteEnhanced();
    };
    enhanced.__qfEnhanced=true;window.setLang=enhanced;
  }

  function hookProfessionalGenerator(){
    if(typeof window.generateProfessionalQuote!=="function"||window.generateProfessionalQuote.__qfWrapped)return;
    const original=window.generateProfessionalQuote;
    const wrapped=function(){
      try{ original(); }catch(e){}
      generateProfessionalQuoteEnhanced();
    };
    wrapped.__qfWrapped=true;window.generateProfessionalQuote=wrapped;
  }

  function init(){
    injectEnhancementCSS();
    enhanceAddItem();
    hookProfessionalGenerator();
    enhanceSharing();
    addToolbar();
    try{
      const saved=localStorage.getItem(LANG_KEY);
      if(saved && typeof window.setLang === "function") window.setLang(saved);
    }catch{}
    enhanceLanguage();
    translateStaticUI();
    normalizeItems();
    renderEnhancedItems();
    window.qfUpdateDashboard = updateEnhancedDashboard;
    updateEnhancedDashboard();
    window.addEventListener("beforeprint",prepareProfessionalPrint);
    window.addEventListener("afterprint",()=>{if(printOpenedProfessional){const p=$("proQuote");if(p)p.classList.add("hidden");printOpenedProfessional=false;}});
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
