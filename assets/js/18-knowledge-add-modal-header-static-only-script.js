// Extracted from V83 inline script block 18. Original id: knowledge-add-modal-header-static-only-script

(function () {
        function syncKnowledgeModalHeader() {
          var modal = document.getElementById("modal");
          var title = document.getElementById("modalTitle");
          if (!modal || !title) return;
          var txt = (title.textContent || "").trim();
          modal.classList.toggle(
            "knowledge-form-modal",
            txt === "إضافة معرفة" || txt === "تعديل معرفة",
          );
        }
        document.addEventListener(
          "click",
          function () {
            setTimeout(syncKnowledgeModalHeader, 0);
            setTimeout(syncKnowledgeModalHeader, 120);
          },
          true,
        );
        new MutationObserver(syncKnowledgeModalHeader).observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        syncKnowledgeModalHeader();
      })();
