import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  renderOption,
  renderSelected,
  icon = null,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown ${disabled ? 'dropdown-disabled' : ''}`} ref={dropdownRef}>
      <div 
        className={`dropdown-trigger ${isOpen ? 'dropdown-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {icon && <span className="dropdown-icon">{icon}</span>}
        <span className="dropdown-value">
          {selectedOption 
            ? (renderSelected ? renderSelected(selectedOption) : selectedOption.label)
            : placeholder
          }
        </span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'dropdown-arrow-up' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div
              key={option.value || index}
              className={`dropdown-item ${value === option.value ? 'dropdown-item-selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {renderOption ? renderOption(option) : option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;