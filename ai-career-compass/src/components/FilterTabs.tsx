interface FilterTabsProps {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}

const FilterTabs = ({ tabs, active, onSelect }: FilterTabsProps) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => onSelect(tab)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active === tab
            ? 'gradient-bg-primary text-primary-foreground shadow-lg'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default FilterTabs;
