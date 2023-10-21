import React from 'react';

const GenerateInvoice = ({ data }) => {
  // Assuming that the 'data' prop contains information about the invoice
  const { invoiceNumber, date, customerName, items, totalAmount } = data;

  return (
    <div className="invoice">
      <h2>Invoice #{invoiceNumber}</h2>
      <div className="invoice-details">
        <p>Date: {date}</p>
        <p>Customer: {customerName}</p>
      </div>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>${item.unitPrice}</td>
              <td>${item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-amount">
        <p>Total Amount: ${totalAmount}</p>
      </div>
    </div>
  );
};

export default GenerateInvoice;
