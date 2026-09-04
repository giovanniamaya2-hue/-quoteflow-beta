// QuoteFlow Beta - Saved Quotes & Sharing

(function () {

  "use strict";

  const KEY = "quoteflow_quotes_v1";

  function getQuotes() {

    try {

      return JSON.parse(localStorage.getItem(KEY) || "[]");

    } catch {

      return [];

    }

  }

  function saveQuotes(quotes) {

    localStorage.setItem(KEY, JSON.stringify(quotes));

  }

  function quoteNumber() {

    const d = new Date();

    const date =

      d.getFullYear().toString() +

      String(d.getMonth() + 1).padStart(2, "0") +

      String(d.getDate()).padStart(2, "0");

    return "QF-" + date + "-" + String(Date.now()).slice(-4);

  }

  window.quoteFlowSave = function () {

    const fields = document.querySelectorAll("input, textarea, select");

    const data = {};

    fields.forEach((field, i) => {

      if (field.type === "button" || field.type === "submit") return;

      const key =

        field.id ||

        field.name ||

        field.placeholder ||

        "field_" + i;

      data[key] = field.value;

    });

    const quote = {

      id: quoteNumber(),

      created: new Date().toISOString(),

      data: data

    };

    const quotes = getQuotes();

    quotes.unshift(quote);

    saveQuotes(quotes);

    alert("Quote saved: " + quote.id);

    return quote;

  };

  window.quoteFlowQuotes = function () {

    return getQuotes();

  };

  window.quoteFlowShare = async function () {

    const quote = window.quoteFlowSave();

    const text =

      "QuoteFlow Construction\n" +

      "Quote #: " + quote.id + "\n\n" +

      "Construction estimate created with QuoteFlow.";

    if (navigator.share) {

      try {

        await navigator.share({

          title: "QuoteFlow " + quote.id,

          text: text

        });

      } catch (e) {

        // User cancelled sharing.

      }

    } else if (navigator.clipboard) {

      await navigator.clipboard.writeText(text);

      alert("Quote information copied to clipboard.");

    } else {

      alert(text);

    }

  };

  window.quoteFlowPrint = function () {

    window.print();

  };

  // Add a small toolbar to the existing app.

  function addToolbar() {

    if (document.getElementById("qf-beta-toolbar")) return;

    const bar = document.createElement("div");

    bar.id = "qf-beta-toolbar";

    bar.innerHTML = `

      <div style="

        display:flex;

        gap:8px;

        flex-wrap:wrap;

        margin:12px 0;

      ">

        <button type="button" onclick="quoteFlowSave()"

          style="padding:10px 14px;border:0;border-radius:10px;background:#ff7a00;color:#fff;font-weight:700;">

          💾 Save Quote

        </button>

        <button type="button" onclick="quoteFlowShare()"

          style="padding:10px 14px;border:1px solid #ff7a00;border-radius:10px;background:transparent;color:#ff7a00;font-weight:700;">

          📤 Share

        </button>

        <button type="button" onclick="quoteFlowPrint()"

          style="padding:10px 14px;border:1px solid #555;border-radius:10px;background:transparent;color:inherit;font-weight:700;">

          🧾 Print / PDF

        </button>

      </div>

    `;

    const target =

      document.querySelector("main") ||

      document.querySelector(".container") ||

      document.body.firstElementChild ||

      document.body;

    target.prepend(bar);

  }

  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", addToolbar);

  } else {

    addToolbar();

  }

})();
