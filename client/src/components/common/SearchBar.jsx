import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-12 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          <HiOutlineXMark className="w-4 h-4 text-surface-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
