import React, { useState, useRef } from 'react';
import { Button, message, Upload, Modal, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import "./App.css"

const App = () => {
  const [excelData, setExcelData] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const parseExcelData = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const cleanedData = sheetData.map((row) => {
          return Object.fromEntries(
            Object.entries(row).map(([key, value]) => {
              if (typeof value === 'string') {
                return [key, value.replace(/"/g, '')];
              }
              return [key, value];
            })
          );
        });

        resolve(cleanedData);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const generateInvoicePDF = (content, fileName) => {
    const element = document.createElement('div');
    element.innerHTML = content;

    html2pdf(element, {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] },
      onBeforeDownload: () => {
        message.success(`${fileName} download will begin shortly.`);
      },
    });
  };

  const props = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        parseExcelData(info.file.originFileObj).then(parsedData => {
          console.log('Excel Data:', parsedData);
          setExcelData(parsedData);
        });
        setShowVerifyModal(true);
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const verifyColumns = Object.keys(excelData[0] || {}).map((key) => ({
    title: key,
    dataIndex: key,
    key: key,
  }));

  const columnsWithAction = [
    ...verifyColumns,
    {
      title: 'Action',
      key: 'action',
      render: (text, record, index) => (
        <>
          {console.log(record, "record")}
          <Button
            type="primary"
            onClick={() => generateInvoicePDF(renderInvoiceContent(record, index), `${record?.Name} ${record?.Invoice_No}.pdf`)}
          >
            Download PDF
          </Button>
        </>

      ),
    },
  ];

  // const renderInvoiceContent = (data, index) => {
  //   return `
  //     <div style="border: 1px solid black; padding: 10px; margin-bottom: 20px;">
  //       <div style="margin-bottom: 10px;">
  //         <h2>Invoice</h2>
  //       </div>
  //       <div style="margin-bottom: 10px;">
  //         <strong>Invoice No:</strong> ${data?.Invoice_No}
  //       </div>
  //       <div style="margin-bottom: 10px;">
  //         <strong>Bill To:</strong> ${data?.Bill_To}
  //       </div>
  //       <table style="width: 100%; border-collapse: collapse;">
  //         <thead>
  //           <tr>
  //             <th style="border: 1px solid black; padding: 5px;">Description</th>
  //             <th style="border: 1px solid black; padding: 5px;">Hourly Consulting Fee</th>
  //             <th style="border: 1px solid black; padding: 5px;">Duration</th>
  //             <th style="border: 1px solid black; padding: 5px;">Total</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <tr>
  //             <td style="border: 1px solid black; padding: 5px;">${data.DESCRIPTION}</td>
  //             <td style="border: 1px solid black; padding: 5px;">${data.Hourly_Consulting_Fee}</td>
  //             <td style="border: 1px solid black; padding: 5px;">${data.Duration}</td>
  //             <td style="border: 1px solid black; padding: 5px;">${data.TOTAL}</td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </div>
  //   `;
  // };

  const parseExcelDate = (excelDate) => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderInvoiceContent = (data, index) => {
    const formattedDate = parseExcelDate(data.Date);

    return `
    <div class="container-fluid"  key=${index}>
      <div class="row gutters">
        <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
          <div class="card">
            <div class="card-body p-0">
              <div class="invoice-container">
                <div class="invoice-header">
                

                <div class="row gutters">
                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 text-center">
                  <p class="invoice-logo">
                    INVOICE 
                  </p>
                </div>
              </div>

                  <div class="row gutters justify-content-end text-right">
                    <div class="col-lg-6 col-md-6 col-sm-6 ">
                      <address class="text-right">
                        Nextyn Pte Ltd<br />
                        68 Circular Road, #02-01,
                        049422, Singapore
                        <br />
                        info@nextyn.com
                      </address>
                    </div>
                  </div>

                  <div class="row gutters">
                    <div class="col-xl-8 col-lg-8 col-md-12 col-sm-12 col-12">
                      <div class="invoice-details">
                        <address className='text-left'>
                        ${data?.Name} <br />
                        ${data?.Country} <br />
                        ${data?.Address} <br />
                        ${data?.Email_ID}
                        </address>
                      </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12">
                      <div class="invoice-details">
                        <div class="invoice-num">
                          <div>Invoice - ${data?.Invoice_No}</div>
                          <div>Date - ${formattedDate}</div>
                          </div>
                      </div>
                    </div>
                   
                  </div>

                  <div class="row gutters">
                  <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12">
                  <div class="">
                    <div class="">
                    <div class="invoice-footer text-right">
                    Payment terms (Due in 14 days)             
                  </div> 
                      </div>
                  </div>
                </div>
                  
                  </div>
                </div>
                <div class="invoice-body">
                  <div class="row gutters">
                    <div class="col-lg-12 col-md-12 col-sm-12">
                      <div class="table-responsive">
                        <table class="table custom-table m-0">
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th>Hourly Consulting Fee</th>
                              <th>Duration</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                              ${data?.DESCRIPTION}
                                
                              </td>
                              <td>${data?.Hourly_Consulting_Fee}</td>
                              <td>${data?.Duration}</td>
                              <td>${data?.TOTAL}</td>
                            </tr>
                            <tr>
                              <td>&nbsp;</td>
                              <td colspan="2">
                                <p>
                                  Sub Total<br />
                                 
                                </p>
                              </td>
                              <td>
                                <p>
                                  ${data?.SUB_TOTAL}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div class="text-center mt-4">
                          <p class='fw-bolder sys_gen'>* This is a System Generated Invoice *</p>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  };

  const handleDownloadAllInvoices = () => {
    excelData.forEach((data, index) => {
      const content = renderInvoiceContent(data, index);
      generateInvoicePDF(content, `invoice_${index + 1}.pdf`);
    });
  };


  return (
    <div class='container'>
      <div class='row justify-content-center align-items-center text-center' style={{ minHeight: '50vh' }}>
        <div className='col-md-12'>
          <div>
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
          <div class='mt-4'>
            <Table dataSource={excelData} columns={columnsWithAction} scroll={{ x: 800 }}>
            </Table>
          </div>
          {/* <div>
            {excelData.map((data, index) => (
              <div key={index} class='py-2'>
                <Button type="primary" size='large' onClick={() => generateInvoicePDF(renderInvoiceContent(data, index), `invoice_${index}.pdf`)}>
                  Generate Invoice PDF {data?.Invoice_No}
                </Button>
              </div>
            ))}
          </div> */}
        </div>

        {/* <div>
          <div class="container-fluid">
            <div class="row gutters">
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                <div class="card">
                  <div class="card-body p-0">
                    <div class="invoice-container">
                      <div class="invoice-header">

                        <div class="row gutters">
                          <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <a href="index.html" class="invoice-logo">
                              Invoice
                            </a>
                          </div>
                        </div>

                        <div class="row gutters justify-content-end text-right">
                          <div class="col-lg-6 col-md-6 col-sm-6 ">
                            <address class="text-right">
                              Maxwell admin Inc, 45 NorthWest Street.<br />
                              Sunrise Blvd, San Francisco.<br />
                              00000 00000
                            </address>
                          </div>
                        </div>

                        <div class="row gutters">
                          <div class="col-xl-8 col-lg-8 col-md-12 col-sm-12 col-12">
                            <div class="invoice-details">
                              <address className='text-left'>
                                Alex Maxwell<br />
                                150-600 Church Street, Florida, USA
                              </address>
                            </div>
                          </div>
                          <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12">
                            <div class="invoice-details">
                              <div class="invoice-num">
                                <div>Invoice - #009</div>
                                <div>January 10th 2020</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="invoice-body">
                        <div class="row gutters">
                          <div class="col-lg-12 col-md-12 col-sm-12">
                            <div class="table-responsive">
                              <table class="table custom-table m-0">
                                <thead>
                                  <tr>
                                    <th>Description</th>
                                    <th>Hourly Consulting Fee</th>
                                    <th>Duration</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                      Wordpress Template
                                      <p class="m-0 text-muted">
                                        Reference site about Lorem Ipsum, giving information on its origins.
                                      </p>
                                    </td>
                                    <td>#50000981</td>
                                    <td>9</td>
                                    <td>$5000.00</td>
                                  </tr>
                                  <tr>
                                    <td>&nbsp;</td>
                                    <td colspan="2">
                                      <p>
                                        Subtotal<br />

                                      </p>
                                    </td>
                                    <td>
                                      <p>
                                        $5000.00<br />
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div class="text-center mt-4">
                              <p class='fw-bolder sys_gen'>* This is a System Generated Invoice *</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

      </div>
    </div>

  );
};

export default App;
