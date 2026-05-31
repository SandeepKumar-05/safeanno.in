import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geocodeKerala } from '../../lib/geocode';

/**
 * Kerala-biased location autocomplete input.
 * Debounced search, keyboard navigable dropdown.
 *
 * @param {object} props
 * @param {string} props.placeholder
 * @param {Function} props.onSelect — called with { lat, lng, displayName, district }
 * @param {object} [props.value] — currently selected location
 * @param {string} [props.id]
 */
export default function LocationAutocomplete({
  placeholder = 'സ്ഥലം തിരയുക (Search place)',
  onSelect,
  value = null,
  id,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setSelected(value);
  }, [value]);

  // Debounced geocode search
  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await geocodeKerala(q);
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Debounce 400ms
    debounceRef.current = setTimeout(() => {
      search(val);
    }, 400);
  }, [search]);

  const handleSelect = useCallback((item) => {
    setSelected(item);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onSelect) onSelect(item);
  }, [onSelect]);

  const handleClear = useCallback(() => {
    setSelected(null);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onSelect) onSelect(null);
    inputRef.current?.focus();
  }, [onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }, [isOpen, results, activeIndex, handleSelect]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /**
   * Highlight matching text in result name
   */
  function highlightMatch(text, q) {
    if (!q) return text;
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="autocomplete__highlight">{text.slice(index, index + q.length)}</span>
        {text.slice(index + q.length)}
      </>
    );
  }

  // Show selected state
  if (selected) {
    return (
      <div className="autocomplete" id={id}>
        <div className="autocomplete__selected">
          <span>✓</span>
          <span className="autocomplete__selected-text">
            {selected.shortName || selected.displayName}
            {selected.district ? ` — ${selected.district}` : ''}
          </span>
          <button
            type="button"
            className="autocomplete__clear-btn"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="autocomplete" id={id}>
      <input
        ref={inputRef}
        type="text"
        className="autocomplete__input"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        autoComplete="off"
      />

      {loading && (
        <div className="autocomplete__dropdown">
          <div className="autocomplete__loading">തിരയുന്നു... (Searching...)</div>
        </div>
      )}

      {isOpen && !loading && results.length > 0 && (
        <div className="autocomplete__dropdown" ref={dropdownRef}>
          {results.map((item, i) => (
            <div
              key={`${item.lat}-${item.lng}`}
              className={`autocomplete__option ${i === activeIndex ? 'autocomplete__option--active' : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="autocomplete__option-name">
                {highlightMatch(item.shortName || item.displayName.split(',')[0], query)}
              </div>
              {item.district && (
                <div className="autocomplete__option-district">
                  📍 {item.district}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
