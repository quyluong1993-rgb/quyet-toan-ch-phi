interface ExchangeRateConfigProps {
  value: number;
  onChange: (value: number) => void;
}

export function ExchangeRateConfig({ value, onChange }: ExchangeRateConfigProps) {
  return (
    <section className="bg-surface p-lg rounded-xl card-shadow border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
            <div>
                <h2 className="font-headline-md text-headline-md text-primary mb-xs">Exchange Rate Configuration</h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm">Manage settlement benchmarks and manual FX overrides.</p>
            </div>
            <div className="flex items-center gap-lg bg-surface-container-low p-sm rounded-xl">
                <div className="flex items-center gap-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant">Auto API</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input defaultChecked className="sr-only peer" type="checkbox"/>
                        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </div>
                    <span className="font-label-md text-label-md text-secondary font-bold">Manual Override</span>
                </div>
                <div className="h-8 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant">Benchmark (VND/RMB)</label>
                    <input 
                      className="w-24 bg-white border border-outline-variant rounded px-sm py-xs font-headline-md text-headline-md text-primary focus:border-primary outline-none text-center" 
                      type="number" 
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value))}
                    />
                </div>
            </div>
        </div>
    </section>
  );
}
