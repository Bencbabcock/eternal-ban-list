(function() {
  const searchInput = document.getElementById('search-input');
  const searchCount = document.getElementById('search-count');
  const prevBtn = document.getElementById('search-prev');
  const nextBtn = document.getElementById('search-next');
  const clearBtn = document.getElementById('search-clear');

  let highlights = [];
  let currentIndex = -1;

  // Debounce helper
  function debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Clear all highlights
  function clearHighlights() {
    highlights.forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    highlights = [];
    currentIndex = -1;
    updateUI();
  }

  // Update count display and button states
  function updateUI() {
    if (highlights.length === 0) {
      searchCount.textContent = '';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    } else {
      searchCount.textContent = `${currentIndex + 1} of ${highlights.length}`;
      prevBtn.disabled = highlights.length <= 1;
      nextBtn.disabled = highlights.length <= 1;
    }
  }

  // Highlight current match
  function highlightCurrent() {
    highlights.forEach((mark, i) => {
      mark.classList.toggle('current', i === currentIndex);
    });
    if (highlights[currentIndex]) {
      highlights[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Walk text nodes under a root, skipping certain elements
  function getTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script, style, search container, and already-highlighted marks
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('.search-container') || parent.closest('.figure-lightbox')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.textContent.trim() === '') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  // Perform search
  function performSearch(query) {
    clearHighlights();

    if (!query || query.length < 1) return;

    const searchText = query.toLowerCase();
    const textNodes = getTextNodes(document.body);

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const lowerText = text.toLowerCase();
      let startIndex = 0;
      let index;

      const matches = [];
      while ((index = lowerText.indexOf(searchText, startIndex)) !== -1) {
        matches.push({ start: index, end: index + searchText.length });
        startIndex = index + 1;
      }

      if (matches.length === 0) return;

      // Build replacement fragment
      const fragment = document.createDocumentFragment();
      let lastEnd = 0;

      matches.forEach(match => {
        // Text before match
        if (match.start > lastEnd) {
          fragment.appendChild(document.createTextNode(text.slice(lastEnd, match.start)));
        }
        // Highlighted match
        const mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = text.slice(match.start, match.end);
        fragment.appendChild(mark);
        highlights.push(mark);
        lastEnd = match.end;
      });

      // Text after last match
      if (lastEnd < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastEnd)));
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    if (highlights.length > 0) {
      currentIndex = 0;
      highlightCurrent();
    }
    updateUI();
  }

  const debouncedSearch = debounce(performSearch, 200);

  // Event listeners
  searchInput.addEventListener('input', function() {
    debouncedSearch(this.value);
  });

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrev();
      } else {
        goToNext();
      }
    }
    if (e.key === 'Escape') {
      clearBtn.click();
    }
  });

  function goToNext() {
    if (highlights.length === 0) return;
    currentIndex = (currentIndex + 1) % highlights.length;
    highlightCurrent();
    updateUI();
  }

  function goToPrev() {
    if (highlights.length === 0) return;
    currentIndex = (currentIndex - 1 + highlights.length) % highlights.length;
    highlightCurrent();
    updateUI();
  }

  nextBtn.addEventListener('click', goToNext);
  prevBtn.addEventListener('click', goToPrev);

  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    clearHighlights();
    searchInput.focus();
  });
})();
