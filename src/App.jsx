import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Car, 
  Fuel, 
  DollarSign, 
  BarChart3, 
  Plus, 
  Edit2,
  Calendar,
  Gauge,
  Droplet,
  Info,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User,
  Clock,
  Wrench,
  Receipt,
  Settings,
  Target,
  PiggyBank,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  XAxis, 
  YAxis 
} from 'recharts';

// --- Utility Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) => {
  const baseStyle = "px-4 py-3 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600"
  };
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, required = false, step }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      step={step}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 bg-slate-50 focus:bg-white"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('car');
  
  // -- State --
  const [car, setCar] = useState(() => {
    const saved = localStorage.getItem('gigtrack_car');
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gigtrack_settings');
    return saved ? JSON.parse(saved) : { 
  taxRate: 15, 
  weeklyGoal: 500,
  currency: 'AUD'
};
  });

  const [fuelLogs, setFuelLogs] = useState(() => {
    const saved = localStorage.getItem('gigtrack_fuel');
    return saved ? JSON.parse(saved) : [];
  });

  const [tripLogs, setTripLogs] = useState(() => {
    const saved = localStorage.getItem('gigtrack_trips');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenseLogs, setExpenseLogs] = useState(() => {
    const saved = localStorage.getItem('gigtrack_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // -- Persistence Effects --
  useEffect(() => {
    if (car) localStorage.setItem('gigtrack_car', JSON.stringify(car));
  }, [car]);

  useEffect(() => {
    localStorage.setItem('gigtrack_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('gigtrack_fuel', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('gigtrack_trips', JSON.stringify(tripLogs));
  }, [tripLogs]);

  useEffect(() => {
    localStorage.setItem('gigtrack_expenses', JSON.stringify(expenseLogs));
  }, [expenseLogs]);

  // -- Derived Metrics (Global) --
  const globalMetrics = useMemo(() => {
    const sortedFuel = [...fuelLogs].sort((a, b) => b.odometer - a.odometer);
    
    // Calculate Global Average Cost Per KM from Fuel Logs
    let totalDist = 0;
    let totalFuelCost = 0;
    let totalLitres = 0;
    let avgCostPerKm = 0;
    let avgEfficiency = 0;
    let isEstimate = false;

    if (sortedFuel.length > 1) {
  for (let i = 0; i < sortedFuel.length - 1; i++) {
    const current = sortedFuel[i];
    const previous = sortedFuel[i + 1];

    if (current.fullTank && previous.fullTank) {
      const dist = current.odometer - previous.odometer;

      if (dist > 0) {
        totalDist += dist;
        totalFuelCost += current.totalPrice;
        totalLitres += current.litres;
      }
    }
  }

  if (totalDist > 0) {
  avgCostPerKm = totalFuelCost / totalDist;
  avgEfficiency = totalLitres > 0 ? totalDist / totalLitres : 0;
} else if (sortedFuel.length > 0) {
  // Fallback estimate when not enough full tanks
  const latest = sortedFuel[0];

  const fallbackEfficiency = 10; // km per litre (safe average)
  avgEfficiency = fallbackEfficiency;
  avgCostPerKm = latest.price / fallbackEfficiency;
  isEstimate = true;
}
} else if (sortedFuel.length === 1) {
        const log = sortedFuel[0];
        avgEfficiency = 10; // Fallback estimate
        avgCostPerKm = log.price / avgEfficiency;
        isEstimate = true;
    }

    return {
      sortedFuel,
      avgCostPerKm,
      avgEfficiency,
      isEstimate
    };
  }, [fuelLogs]);

  // -- Actions --
  const handleSaveCar = (carData) => {
    setCar(carData);
    if (!activeTab) setActiveTab('fuel');
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const handleAddFuel = (entry) => {
	  if (car && entry.odometer <= car.odometer) {
  alert("Odometer must be higher than previous reading");
  return;
}
    const newEntry = { ...entry, id: Date.now(), totalPrice: entry.litres * entry.price };
    setFuelLogs(prev => [newEntry, ...prev]);
    if (car && entry.odometer > car.odometer) {
      setCar(prev => ({ ...prev, odometer: entry.odometer }));
    }
  };

  const handleAddTrip = (entry) => {
    const newEntry = { ...entry, id: Date.now() };
    setTripLogs(prev => [newEntry, ...prev]);
  };

  const handleUpdateTrip = (updatedTrip) => {
    setTripLogs(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleAddExpense = (entry) => {
    const newEntry = { ...entry, id: Date.now() };
    setExpenseLogs(prev => [newEntry, ...prev]);
  };

  const handleDeleteFuel = (id) => {
    setFuelLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleDeleteTrip = (id) => {
    setTripLogs(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteExpense = (id) => {
    setExpenseLogs(prev => prev.filter(e => e.id !== id));
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.car) setCar(data.car);
          if (data.settings) setSettings(data.settings);
          if (data.fuelLogs) setFuelLogs(data.fuelLogs);
          if (data.tripLogs) setTripLogs(data.tripLogs);
          if (data.expenseLogs) setExpenseLogs(data.expenseLogs);
          alert('Data restored successfully!');
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportData = () => {
    const data = { car, settings, fuelLogs, tripLogs, expenseLogs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gigtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // -- Render Helpers --
  const formatCurrency = (val) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: settings.currency || 'AUD'
  }).format(val);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  // -- Views --

  const CarView = () => {
    const [isEditing, setIsEditing] = useState(!car);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [formData, setFormData] = useState(car || {
      name: '',
      fuelType: 'Petrol',
      tankSize: '',
      odometer: ''
    });
    const [settingsData, setSettingsData] = useState(settings);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveCar({
        ...formData,
        tankSize: Number(formData.tankSize),
        odometer: Number(formData.odometer)
      });
      setIsEditing(false);
    };

    const handleSettingsSubmit = (e) => {
      e.preventDefault();
      handleSaveSettings({
        taxRate: Number(settingsData.taxRate),
        weeklyGoal: Number(settingsData.weeklyGoal)
      });
      setIsEditingSettings(false);
    };

    if (isEditing) {
      return (
        <div className="p-4 max-w-lg mx-auto h-full overflow-y-auto pb-24">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Car className="text-blue-600" /> Car Profile
          </h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <Input 
              label="Car Name" 
              placeholder="e.g. Toyota Camry Hybrid" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
            <Select 
              label="Fuel Type" 
              options={[
                {label: 'Petrol', value: 'Petrol'}, 
                {label: 'Diesel', value: 'Diesel'}, 
                {label: 'Hybrid', value: 'Hybrid'},
                {label: 'Electric', value: 'Electric'}
              ]}
              value={formData.fuelType}
              onChange={e => setFormData({...formData, fuelType: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Tank Size (L)" 
                type="number" 
                placeholder="50" 
                value={formData.tankSize} 
                onChange={e => setFormData({...formData, tankSize: e.target.value})} 
                required 
              />
              <Input 
                label="Odometer" 
                type="number" 
                placeholder="120000" 
                value={formData.odometer} 
                onChange={e => setFormData({...formData, odometer: e.target.value})} 
                required 
              />
            </div>
            <Button type="submit" className="w-full mt-4">Save Car Profile</Button>
            {car && (
              <Button variant="secondary" className="w-full mt-2" onClick={() => setIsEditing(false)}>Cancel</Button>
            )}
          </form>
        </div>
      );
    }

    return (
      <div className="p-4 max-w-lg mx-auto space-y-4 h-full overflow-y-auto pb-24">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider">Current Vehicle</h3>
              <h1 className="text-3xl font-bold mt-1">{car.name}</h1>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-500/30 rounded-full text-sm font-medium border border-blue-400/30">
                {car.fuelType}
              </span>
            </div>
            <button onClick={() => setIsEditing(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
               <Edit2 size={18} className="text-white" />
            </button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-200 text-sm">Odometer</p>
              <p className="text-xl font-semibold">{car.odometer.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Avg Efficiency</p>
              <p className="text-xl font-semibold">
                {globalMetrics.avgEfficiency.toFixed(1)} km/L
                {globalMetrics.isEstimate && <span className="text-xs text-blue-200 ml-1">(est)</span>}
              </p>
            </div>
          </div>
        </Card>

        {/* Global Stats */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <DollarSign size={20} />
              </div>
              <span className="text-slate-500 text-sm">Cost / km</span>
              <span className="text-lg font-bold text-slate-800">
                {formatCurrency(globalMetrics.avgCostPerKm)}
              </span>
           </Card>
           <Card className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                <Gauge size={20} />
              </div>
              <span className="text-slate-500 text-sm">Tank Size</span>
              <span className="text-lg font-bold text-slate-800">{car.tankSize} L</span>
           </Card>
        </div>

        {/* App Settings */}
        <Card className="p-4">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
               <Settings size={16} /> Business Settings
             </h3>
             <button onClick={() => setIsEditingSettings(!isEditingSettings)} className="text-blue-600 text-sm font-medium">
               {isEditingSettings ? 'Done' : 'Edit'}
             </button>
           </div>
           
           {isEditingSettings ? (
             <form onSubmit={handleSettingsSubmit}>
                <Input label="Weekly Income Goal ($)" type="number" value={settingsData.weeklyGoal} onChange={e => setSettingsData({...settingsData, weeklyGoal: e.target.value})} />
                <Input label="Est. Tax Rate (%)" type="number" value={settingsData.taxRate} onChange={e => setSettingsData({...settingsData, taxRate: e.target.value})} />
                <Button type="submit" className="w-full !py-2">Save Settings</Button>
             </form>
           ) : (
             <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                 <div className="flex items-center gap-2 text-slate-700">
                   <Target size={18} className="text-indigo-500"/> <span>Weekly Goal</span>
                 </div>
                 <span className="font-bold text-slate-900">{formatCurrency(settings.weeklyGoal)}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                 <div className="flex items-center gap-2 text-slate-700">
                   <PiggyBank size={18} className="text-pink-500"/> <span>Tax Rate</span>
                 </div>
                 <span className="font-bold text-slate-900">{settings.taxRate}%</span>
               </div>
             </div>
           )}
        </Card>

        {/* Data Management Section */}
        <div className="mt-2 border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">Data Management</h3>
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" onClick={handleExportData} className="text-sm">
               <Download size={16} /> Backup Data
             </Button>
             <Button variant="outline" onClick={() => fileInputRef.current.click()} className="text-sm">
               <Upload size={16} /> Restore Data
             </Button>
             <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
          </div>
        </div>
      </div>
    );
  };

  const FuelView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
  odometer: car?.odometer || '',
  litres: '',
  price: '',
  fullTank: true
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddFuel({
  date: formData.date,
  odometer: Number(formData.odometer),
  litres: Number(formData.litres),
  price: Number(formData.price),
  fullTank: formData.fullTank
});
      setIsAdding(false);
      setFormData({ date: new Date().toISOString().split('T')[0], odometer: '', litres: '', price: '' });
    };

    return (
      <div className="p-4 max-w-lg mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Fuel className="text-orange-600" /> Fuel Log
          </h2>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "primary"} className="!py-2">
            {isAdding ? "Cancel" : <><Plus size={18} /> Add Fill</>}
          </Button>
        </div>
        
        {globalMetrics.sortedFuel.length === 1 && (
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4 flex gap-2 items-start">
            <Info className="shrink-0 mt-0.5" size={16} />
            <p>We're estimating costs based on your first fill. Add a <strong>second fill</strong> later to get precise accuracy!</p>
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              <Input label="Odometer" type="number" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Litres" type="number" step="0.01" value={formData.litres} onChange={e => setFormData({...formData, litres: e.target.value})} required />
              <Input label="Price / Litre" type="number" step="0.001" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>
			<div className="flex items-center gap-2 mb-4">
  <input
    type="checkbox"
    checked={formData.fullTank}
    onChange={e => setFormData({...formData, fullTank: e.target.checked})}
  />
  <label className="text-sm text-slate-600">Full Tank Fill</label>
</div>
            <div className="flex items-center justify-between text-sm text-slate-500 bg-orange-50 p-3 rounded-lg mb-4">
               <span>Total Cost:</span>
               <span className="font-bold text-orange-700">
                 {formData.litres && formData.price ? formatCurrency(formData.litres * formData.price) : '$0.00'}
               </span>
            </div>
            <Button type="submit" className="w-full">Save Entry</Button>
          </form>
        )}

        <div className="space-y-3 flex-1 overflow-auto pb-20">
          {globalMetrics.sortedFuel.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Droplet size={48} className="mx-auto mb-3 opacity-30" />
              <p>No fuel logs yet.</p>
              <p className="text-sm">Add a fill to track efficiency.</p>
            </div>
          ) : (
            globalMetrics.sortedFuel.map((log, idx) => {
              const prevLog = globalMetrics.sortedFuel[idx + 1];
let efficiency = null;

if (prevLog && log.fullTank && prevLog.fullTank) {
  const dist = log.odometer - prevLog.odometer;
  efficiency = dist > 0 ? dist / log.litres : null;
}

              return (
                <Card key={log.id} className="p-4 flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">{formatDate(log.date)}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{log.odometer.toLocaleString()} km</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {log.litres}L @ {formatCurrency(log.price)}/L
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{formatCurrency(log.totalPrice)}</div>
                    {efficiency && (
                      <div className={`text-xs font-medium ${efficiency > 15 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {efficiency.toFixed(1)} km/L
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteFuel(log.id)} className="ml-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const ExpensesView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      category: 'Maintenance',
      cost: '',
      note: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddExpense({
        ...formData,
        cost: Number(formData.cost)
      });
      setIsAdding(false);
      setFormData({ date: new Date().toISOString().split('T')[0], category: 'Maintenance', cost: '', note: '' });
    };

    const sortedExpenses = [...expenseLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div className="p-4 max-w-lg mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-slate-600" /> Expenses
          </h2>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "primary"} className="!py-2">
            {isAdding ? "Cancel" : <><Plus size={18} /> Add Cost</>}
          </Button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 animate-in slide-in-from-top-4">
             <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              <Select 
                label="Category" 
                options={[
                  {label: 'Maintenance', value: 'Maintenance'}, 
                  {label: 'Insurance', value: 'Insurance'}, 
                  {label: 'Repairs', value: 'Repairs'}, 
                  {label: 'Cleaning', value: 'Cleaning'},
                  {label: 'Registration', value: 'Registration'},
                  {label: 'Other', value: 'Other'}
                ]}
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <Input label="Cost ($)" type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
            <Input label="Note (Optional)" placeholder="e.g. Oil change and filter" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
            <Button type="submit" className="w-full">Save Expense</Button>
          </form>
        )}

        <div className="space-y-3 flex-1 overflow-auto pb-20">
          {sortedExpenses.length === 0 ? (
             <div className="text-center py-12 text-slate-400">
             <Receipt size={48} className="mx-auto mb-3 opacity-30" />
             <p>No expenses logged.</p>
             <p className="text-sm">Track maintenance & other costs here.</p>
           </div>
          ) : (
            sortedExpenses.map(expense => (
              <Card key={expense.id} className="p-4 flex justify-between items-center group">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
                        {expense.category}
                      </span>
                      <span className="text-sm text-slate-500">{formatDate(expense.date)}</span>
                    </div>
                    {expense.note && <div className="text-sm text-slate-800">{expense.note}</div>}
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{formatCurrency(expense.cost)}</span>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                 </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const TripsView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      type: 'Business', // 'Business' | 'Personal'
      platform: 'DoorDash',
      km: '',
      duration: '',
      earnings: ''
    });

    useEffect(() => {
      if (editingTrip) {
        setFormData({
          date: editingTrip.date,
          type: editingTrip.type || 'Business',
          platform: editingTrip.platform,
          km: editingTrip.km,
          duration: editingTrip.duration || '',
          earnings: editingTrip.earnings
        });
        setIsAdding(true);
      }
    }, [editingTrip]);

    const handleCloseForm = () => {
      setIsAdding(false);
      setEditingTrip(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Business',
        platform: 'DoorDash',
        km: '',
        duration: '',
        earnings: ''
      });
    }

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        ...formData,
        km: Number(formData.km),
        duration: formData.duration ? Number(formData.duration) : 0,
        earnings: formData.type === 'Personal' ? 0 : Number(formData.earnings)
      };

      if (editingTrip) {
        handleUpdateTrip({ ...payload, id: editingTrip.id });
      } else {
        handleAddTrip(payload);
      }
      handleCloseForm();
    };

    // Calculate Week Progress
    const weekProgress = useMemo(() => {
       const today = new Date();
const dayOfWeek = today.getDay();
const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

const startOfWeek = new Date(today);
startOfWeek.setDate(diff);
startOfWeek.setHours(0,0,0,0);
       
       const weekEarnings = tripLogs
        .filter(t => new Date(t.date) >= startOfWeek && t.type === 'Business')
        .reduce((acc, t) => acc + (t.earnings || 0), 0);
        
       const percent = Math.min(100, (weekEarnings / settings.weeklyGoal) * 100);
      const weekBusinessKm = tripLogs
  .filter(t => new Date(t.date) >= startOfWeek && t.type === 'Business')
  .reduce((acc, t) => acc + t.km, 0);

const weekEstimatedFuel = weekBusinessKm * globalMetrics.avgCostPerKm;
const weekNet = weekEarnings - weekEstimatedFuel;

const weekProfitPerKm = weekBusinessKm > 0 
  ? weekNet / weekBusinessKm 
  : 0;

return { 
  current: weekEarnings, 
  percent,
  weekProfitPerKm
};
    }, [tripLogs, settings.weeklyGoal]);

    const enrichedTrips = tripLogs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(trip => {
        const estimatedFuelCost = trip.km * globalMetrics.avgCostPerKm;
        const netProfit = (trip.earnings || 0) - estimatedFuelCost;
        const hourlyRate = trip.duration > 0 && trip.earnings > 0 ? trip.earnings / trip.duration : 0;
        return { ...trip, estimatedFuelCost, netProfit, hourlyRate };
      });

    return (
      <div className="p-4 max-w-lg mx-auto h-full flex flex-col">
        {/* Goal Progress Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-end mb-2">
             <div>
               <span className="text-xs font-bold text-slate-400 uppercase">Weekly Goal</span>
               <div className="font-bold text-slate-800 text-lg">
                 {formatCurrency(weekProgress.current)} <span className="text-slate-400 text-sm font-normal">/ {formatCurrency(settings.weeklyGoal)}</span>
               </div>
             </div>
             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{weekProgress.percent.toFixed(0)}%</span>
           </div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${weekProgress.percent}%` }}></div>
           </div>
		   <div className="mt-4 pt-3 border-t border-slate-100">
  <div className="flex justify-between text-sm">
    <span className="text-slate-500">Weekly Profit / KM</span>
    <span className="font-bold text-indigo-600">
      {formatCurrency(weekProgress.weekProfitPerKm)} / km
    </span>
  </div>
</div>

        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-emerald-600" /> Trips
          </h2>
          <Button onClick={() => isAdding ? handleCloseForm() : setIsAdding(true)} variant={isAdding ? "secondary" : "primary"} className="!py-2">
            {isAdding ? "Cancel" : <><Plus size={18} /> Log Trip</>}
          </Button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 animate-in slide-in-from-top-4">
             <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase">{editingTrip ? 'Edit Trip' : 'New Trip'}</h3>
             
             <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
               {['Business', 'Personal'].map(t => (
                 <button
                   key={t}
                   type="button"
                   onClick={() => setFormData({...formData, type: t})}
                   className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${formData.type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                 >
                   {t === 'Business' ? <Briefcase size={16}/> : <User size={16}/>}
                   {t}
                 </button>
               ))}
             </div>

             <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              <Input label="Km Driven" type="number" placeholder="45" value={formData.km} onChange={e => setFormData({...formData, km: e.target.value})} required />
            </div>
            
            <Input label="Duration (Hours)" type="number" step="0.1" placeholder="e.g. 3.5" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />

            {formData.type === 'Business' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                <Select 
                  label="Platform" 
                  options={[{label: 'DoorDash', value: 'DoorDash'}, {label: 'Uber Eats', value: 'Uber Eats'}, {label: 'Menulog', value: 'Menulog'}, {label: 'Amazon Flex', value: 'Amazon Flex'}]}
                  value={formData.platform}
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                />
                <Input label="Earnings ($)" type="number" step="0.01" placeholder="120.50" value={formData.earnings} onChange={e => setFormData({...formData, earnings: e.target.value})} required />
              </div>
            )}

            <Button type="submit" className="w-full mt-2">{editingTrip ? 'Update Trip' : 'Save Trip'}</Button>
          </form>
        )}

        <div className="space-y-3 flex-1 overflow-auto pb-20">
          {enrichedTrips.length === 0 ? (
             <div className="text-center py-12 text-slate-400">
             <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
             <p>No trips logged.</p>
             <p className="text-sm">Start tracking your earnings.</p>
           </div>
          ) : (
            enrichedTrips.map(trip => (
              <Card key={trip.id} className="p-4 group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {trip.type === 'Personal' ? (
                       <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                         <User size={12} /> Personal
                       </span>
                    ) : (
                       <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${trip.platform === 'DoorDash' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                         <Briefcase size={12} /> {trip.platform}
                       </span>
                    )}
                    <span className="text-sm text-slate-500">{formatDate(trip.date)}</span>
                  </div>
                  <div className="text-right">
                     {trip.type === 'Business' && <span className="block font-bold text-slate-800">{formatCurrency(trip.earnings)}</span>}
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-slate-100 pt-2 mt-2">
                  <div className="text-xs text-slate-500">
                    <div>{trip.km} km driven {trip.duration > 0 && `• ${trip.duration} hrs`}</div>
                    <div className="mt-1 text-slate-400">
                      Fuel Cost: ~{formatCurrency(trip.estimatedFuelCost)}
                    </div>
                  </div>
                  <div className="text-right">
                    {trip.type === 'Business' && (
                      <>
                        <span className="text-xs text-slate-400 block">
                           Net Profit 
                           {trip.hourlyRate > 0 && <span className="text-blue-600 font-medium ml-1">({formatCurrency(trip.hourlyRate)}/hr)</span>}
                        </span>
                        <span className={`font-semibold ${trip.netProfit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {formatCurrency(trip.netProfit)}
                        </span>
                      </>
                    )}
                    {trip.type === 'Personal' && (
                       <span className="text-xs text-slate-400 italic">Personal Trip</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-3 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingTrip(trip)} className="text-xs text-blue-600 flex items-center gap-1 font-medium hover:underline">
                      <Edit2 size={12}/> Edit
                    </button>
                    <button onClick={() => handleDeleteTrip(trip.id)} className="text-xs text-red-500 flex items-center gap-1 font-medium hover:underline">
                      <Trash2 size={12}/> Delete
                    </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const AnalyticsView = () => {
	  
    // Mode State: 'day', 'week', 'month', 'year'
    const [viewMode, setViewMode] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
	const [includeExternalExpenses, setIncludeExternalExpenses] = useState(true);
	const [includeTax, setIncludeTax] = useState(true);
	const [includePersonalFuel, setIncludePersonalFuel] = useState(true);

    // -- Date Navigation Logic --
    const navigateDate = (direction) => {
      const newDate = new Date(currentDate);
      if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
      if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
      if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + direction);
      setCurrentDate(newDate);
    };

    // Helper: Parse YYYY-MM-DD string to local Date object (midnight)
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const getDateRange = () => {
      const now = new Date(currentDate);
      const start = new Date(now);
      const end = new Date(now);
      
      if (viewMode === 'day') {
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
      } else if (viewMode === 'week') {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0,0,0,0);
        
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
      } else if (viewMode === 'month') {
        start.setDate(1);
        start.setHours(0,0,0,0);
        
        end.setFullYear(start.getFullYear(), start.getMonth() + 1, 0);
        end.setHours(23,59,59,999);
      } else if (viewMode === 'year') {
        start.setMonth(0, 1);
        start.setHours(0,0,0,0);
        
        end.setFullYear(start.getFullYear(), 11, 31);
        end.setHours(23,59,59,999);
      }
      return { start, end };
    };

    const formatRangeLabel = () => {
      if (viewMode === 'day') return currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (viewMode === 'week') {
        const { start, end } = getDateRange();
        return `${start.getDate()} ${start.toLocaleDateString(undefined, {month:'short'})} - ${end.getDate()} ${end.toLocaleDateString(undefined, {month:'short'})}`;
      }
      if (viewMode === 'month') return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (viewMode === 'year') return currentDate.getFullYear();
    };

    // -- Filtering Data --
    const filteredData = useMemo(() => {
      const { start, end } = getDateRange();
      
      const trips = tripLogs.filter(t => {
        const d = parseLocalDate(t.date);
        return d >= start && d <= end;
      });
      
      const fuel = fuelLogs.filter(f => {
        const d = parseLocalDate(f.date);
        return d >= start && d <= end;
      });

      const expenses = expenseLogs.filter(e => {
        const d = parseLocalDate(e.date);
        return d >= start && d <= end;
      });

      return { trips, fuel, expenses };
    }, [currentDate, viewMode, tripLogs, fuelLogs, expenseLogs]);

    // -- Calculating Metrics --
    const periodMetrics = useMemo(() => {
        const businessTrips = filteredData.trips.filter(t => t.type !== 'Personal');
        const personalTrips = filteredData.trips.filter(t => t.type === 'Personal');

        const totalEarnings = businessTrips.reduce((acc, t) => acc + (t.earnings || 0), 0);
        const totalDuration = businessTrips.reduce((acc, t) => acc + (t.duration || 0), 0);
        
        const businessKm = businessTrips.reduce((acc, t) => acc + t.km, 0);
        const personalKm = personalTrips.reduce((acc, t) => acc + t.km, 0);
        
        const estBusinessFuelCost = businessKm * globalMetrics.avgCostPerKm;
        const estPersonalFuelCost = personalKm * globalMetrics.avgCostPerKm;
        const totalOtherExpensesRaw = filteredData.expenses.reduce(
  (acc, e) => acc + e.cost,
  0
);

const totalOtherExpenses = includeExternalExpenses
  ? totalOtherExpensesRaw
  : 0;
        
        const fuelCostToUse = includePersonalFuel
  ? estBusinessFuelCost + estPersonalFuelCost
  : estBusinessFuelCost;

const netProfitBeforeTax =
  totalEarnings - fuelCostToUse - totalOtherExpenses;

const estimatedTax =
  netProfitBeforeTax > 0
    ? netProfitBeforeTax * (settings.taxRate / 100)
    : 0;

const netProfitAfterTax = netProfitBeforeTax - estimatedTax;

// Final profit depending on toggle
const netFinal = includeTax
  ? netProfitAfterTax
  : netProfitBeforeTax;
        
        const actualFuelSpend = filteredData.fuel.reduce((acc, f) => acc + f.totalPrice, 0);
        const totalLitres = filteredData.fuel.reduce((acc, f) => acc + f.litres, 0);
        const hourlyRate = totalDuration > 0 ? totalEarnings / totalDuration : 0;

        const profitPerKm =
  businessKm > 0
    ? netFinal / businessKm
    : 0;

return { 
  totalEarnings, 
  netProfitBeforeTax,
  netFinal,
  estimatedTax,
  estBusinessFuelCost, 
  estPersonalFuelCost, 
  totalOtherExpenses,
  actualFuelSpend,
  totalLitres,
  businessKm,
  personalKm,
  hourlyRate,
  totalDuration,
  profitPerKm
};
    }, [
  filteredData,
  globalMetrics.avgCostPerKm,
  settings.taxRate,
  includeExternalExpenses,
  includeTax,
  includePersonalFuel
]);

    // -- Chart Data --
    const earningsByPlatform = filteredData.trips
      .filter(t => t.type !== 'Personal')
      .reduce((acc, curr) => {
        const found = acc.find(i => i.name === curr.platform);
        if (found) found.value += curr.earnings;
        else acc.push({ name: curr.platform, value: curr.earnings });
        return acc;
      }, []);

    // New Chart: Efficiency by Platform ($/hr)
    const efficiencyByPlatform = filteredData.trips
      .filter(t => t.type !== 'Personal' && t.duration > 0)
      .reduce((acc, curr) => {
        const found = acc.find(i => i.name === curr.platform);
        if (found) {
          found.earnings += curr.earnings;
          found.duration += curr.duration;
        } else {
          acc.push({ name: curr.platform, earnings: curr.earnings, duration: curr.duration });
        }
        return acc;
      }, [])
      .map(p => ({
        name: p.name,
        hourly: p.duration > 0 ? parseFloat((p.earnings / p.duration).toFixed(2)) : 0
      }))
      .sort((a, b) => b.hourly - a.hourly);

    const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];

    const costBreakdownData = [
        { name: 'Bus. Fuel', value: periodMetrics.estBusinessFuelCost, fill: '#ef4444' },
        { name: 'Pers. Fuel', value: periodMetrics.estPersonalFuelCost, fill: '#94a3b8' },
        { name: 'Expenses', value: periodMetrics.totalOtherExpenses, fill: '#f59e0b' },
        { name: 'Est. Tax', value: periodMetrics.estimatedTax, fill: '#d946ef' },
        { name: 'Net Profit', value: periodMetrics.netFinal, fill: '#10b981' },
    ];

    return (
      <div className="p-4 max-w-lg mx-auto pb-24 h-full overflow-y-auto">
        <div className="mb-6">
  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
    <BarChart3 className="text-indigo-600" /> Analytics
  </h2>

  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
  <span className="text-sm text-slate-600">
    Include External Expenses
  </span>

  <button
    onClick={() => setIncludeExternalExpenses(prev => !prev)}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
      includeExternalExpenses ? 'bg-indigo-600' : 'bg-slate-300'
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
        includeExternalExpenses ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
</div>

{/* Include Tax */}
<div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm mt-3">
  <span className="text-sm text-slate-600">
    Include Tax in Calculations
  </span>

  <button
    onClick={() => setIncludeTax(prev => !prev)}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
      includeTax ? 'bg-indigo-600' : 'bg-slate-300'
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
        includeTax ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
</div>

{/* Include Personal Fuel */}
<div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm mt-3">
  <span className="text-sm text-slate-600">
    Include Personal Fuel
  </span>

  <button
    onClick={() => setIncludePersonalFuel(prev => !prev)}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
        includePersonalFuel ? 'bg-indigo-600' : 'bg-slate-300'
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
        includePersonalFuel ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
</div>

        {/* Date Navigation Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 mb-6">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
             {['day', 'week', 'month', 'year'].map(mode => (
               <button
                 key={mode}
                 onClick={() => setViewMode(mode)}
                 className={`flex-1 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {mode}
               </button>
             ))}
          </div>
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" onClick={() => navigateDate(-1)} className="!p-2"><ChevronLeft size={20}/></Button>
            <span className="font-bold text-slate-800 min-w-[120px] text-center">{formatRangeLabel()}</span>
            <Button variant="ghost" onClick={() => navigateDate(1)} className="!p-2"><ChevronRight size={20}/></Button>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">

  {/* Gross Earnings */}
  <Card className="p-4 bg-slate-50 border-slate-200">
    <p className="text-slate-600 text-xs font-bold uppercase">
      Gross Earnings
    </p>
    <p className="text-2xl font-bold text-slate-900 mt-1">
      {formatCurrency(periodMetrics.totalEarnings)}
    </p>
  </Card>

  {/* Net After Fuel & Expenses */}
  <Card className="p-4 bg-emerald-50 border-emerald-100">
    <p className="text-emerald-600 text-xs font-bold uppercase">
      Net (After Fuel & Expenses)
    </p>
    <p className="text-2xl font-bold text-emerald-800 mt-1">
      {formatCurrency(periodMetrics.netFinal)}
    </p>

    {!includeTax && periodMetrics.estimatedTax > 0 && (
      <p className="text-[11px] text-red-500 mt-1">
        Est. Tax: {formatCurrency(periodMetrics.estimatedTax)}
      </p>
    )}
  </Card>

</div>


        {/* Financial Breakdown */}
        <div className="mb-6">
             <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                 <DollarSign size={16} className="text-emerald-500" /> Financial Overview
             </h3>
             
             {periodMetrics.totalEarnings > 0 || periodMetrics.totalOtherExpenses > 0 || periodMetrics.estPersonalFuelCost > 0 ? (
                 <Card className="p-4">
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={costBreakdownData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                                <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {costBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                             </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                       <span>Revenue: <span className="font-semibold text-slate-800">{formatCurrency(periodMetrics.totalEarnings)}</span></span>
                       <span>Costs+Tax: <span className="font-semibold text-red-600">{formatCurrency(
  (includePersonalFuel
    ? periodMetrics.estBusinessFuelCost + periodMetrics.estPersonalFuelCost
    : periodMetrics.estBusinessFuelCost)
  + periodMetrics.totalOtherExpenses
  + (includeTax ? periodMetrics.estimatedTax : 0)
)}</span></span>
                    </div>
                 </Card>
             ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                  No activity in this period.
                </div>
             )}
        </div>

         {/* Efficiency Chart ($/hr) */}
         {efficiencyByPlatform.length > 0 && (
          <div className="mb-6">
             <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                 <Clock size={16} className="text-blue-500" /> Hourly Rate by Platform
             </h3>
             <Card className="p-4">
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={efficiencyByPlatform} layout="vertical" margin={{top: 0, right: 30, left: 20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fontWeight: 500}} />
                            <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => formatCurrency(value) + '/hr'} />
                            <Bar dataKey="hourly" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </Card>
          </div>
        )}

        {/* Expenses Analytics */}
        {periodMetrics.totalOtherExpenses > 0 && (
          <div className="mb-6">
             <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                 <Wrench size={16} className="text-slate-500" /> Expenses Breakdown
             </h3>
             <Card className="p-4">
               {filteredData.expenses.map(e => (
                 <div key={e.id} className="flex justify-between items-center py-2 border-b last:border-0 border-slate-100 text-sm">
                   <div className="flex items-center gap-2">
                     <span className="text-slate-600">{e.category}</span>
                     <span className="text-xs text-slate-400">({formatDate(e.date)})</span>
                   </div>
                   <span className="font-bold text-slate-800">{formatCurrency(e.cost)}</span>
                 </div>
               ))}
               <div className="mt-2 pt-2 text-right font-bold text-slate-800 border-t border-slate-100">
                 Total: {formatCurrency(periodMetrics.totalOtherExpenses)}
               </div>
             </Card>
          </div>
        )}
      </div>
    );
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeTab === id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  // -- Main Layout --
  if (!car && activeTab !== 'car') {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                  <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-6">
                      <Car size={48} className="text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to GigTrack</h1>
                  <p className="text-slate-500 mb-8">To get started, we need to know what you're driving.</p>
                  <Button onClick={() => setActiveTab('car')} className="w-full">Setup My Car</Button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'car' && <CarView />}
        {activeTab === 'fuel' && <FuelView />}
        {activeTab === 'expenses' && <ExpensesView />}
        {activeTab === 'trips' && <TripsView />}
        {activeTab === 'charts' && <AnalyticsView />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-10 pb-safe">
        <div className="flex justify-between items-center max-w-lg mx-auto px-2">
          <NavItem id="car" icon={Car} label="Profile" />
          <NavItem id="fuel" icon={Fuel} label="Fuel" />
          <NavItem id="trips" icon={Calendar} label="Trips" />
          <NavItem id="expenses" icon={Wrench} label="Costs" />
          <NavItem id="charts" icon={BarChart3} label="Analytics" />
        </div>
      </div>
    </div>
  );
}