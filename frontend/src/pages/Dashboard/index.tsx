import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { ExchangeRateConfig } from '../../components/Dashboard/ExchangeRateConfig';
import { InvoiceProcessing } from '../../components/Dashboard/InvoiceProcessing';
import { SettlementPreview } from '../../components/Dashboard/SettlementPreview';

export function Dashboard() {
  const [expenseItems, setExpenseItems] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(3800);

  const handleItemsAdded = (newItems: any[]) => {
    setExpenseItems(prev => [...prev, ...newItems]);
  };

  const handleItemRemoved = (id: string) => {
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemUpdate = (id: string, field: string, value: any) => {
    setExpenseItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate totals if quantity or price changes
        if (field === 'quantity' || field === 'unitPriceRMB') {
          updatedItem.unitPriceVND = updatedItem.unitPriceRMB * exchangeRate;
          updatedItem.totalAmount = updatedItem.quantity * updatedItem.unitPriceVND;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <Layout>
      <ExchangeRateConfig value={exchangeRate} onChange={setExchangeRate} />
      <InvoiceProcessing 
        onItemsAdded={handleItemsAdded} 
        onItemRemoved={handleItemRemoved}
        exchangeRate={exchangeRate}
      />
      {expenseItems.length > 0 && (
        <SettlementPreview 
          items={expenseItems} 
          onItemUpdate={handleItemUpdate} 
          exchangeRate={exchangeRate}
        />
      )}
    </Layout>
  );
}
