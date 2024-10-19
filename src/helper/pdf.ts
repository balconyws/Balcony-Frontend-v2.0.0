'use client';

import axios from 'axios';
import * as PDFLib from 'pdf-lib';
import { format } from 'date-fns';

import { Tenant } from '@/types';
import { capitalizeWords, formatCurrency, validator } from '@/helper';

const getLeaseAgreementPdf = async (tenant: Tenant) => {
  try {
    const policyDoc = tenant.selectedUnit.property.other.leasingPolicyDoc;
    let pdfDoc;
    if (policyDoc) {
      const response = await axios.get(policyDoc, {
        responseType: 'arraybuffer',
      });
      pdfDoc = await PDFLib.PDFDocument.load(response.data);
    } else {
      pdfDoc = await PDFLib.PDFDocument.create();
    }
    const leaseDetailsPdfDoc = await PDFLib.PDFDocument.create();
    const leasePage = leaseDetailsPdfDoc.addPage([600, 400]);
    const leaseText = `
            Property: ${tenant.selectedUnit.property.info.name}
            Rent Amount: ${formatCurrency((tenant.agreement?.rent ?? 0) / 100, 'usd')}
            Security Fee: ${formatCurrency((tenant.agreement?.securityDepositFee ?? 0) / 100, 'usd')}
            Subtotal: ${formatCurrency(
              ((tenant.agreement?.rent ?? 0) + (tenant.agreement?.securityDepositFee ?? 0)) / 100,
              'usd'
            )}
            Service Fee: ${formatCurrency(5, 'usd')}
            Total: ${formatCurrency(
              ((tenant.agreement?.rent ?? 0) + (tenant.agreement?.securityDepositFee ?? 0)) / 100 +
                5,
              'usd'
            )}
            Lease Start Date: ${
              tenant.agreement?.leaseStartDate &&
              format(new Date(tenant.agreement.leaseStartDate), 'dd/MM/yyyy')
            }
            Lease End Date: ${
              tenant.agreement?.leaseEndDate &&
              format(new Date(tenant.agreement.leaseEndDate), 'dd/MM/yyyy')
            }
            Name: ${capitalizeWords(tenant.info.firstName ?? '')}${' '}${capitalizeWords(tenant.info.lastName ?? '')}
            Email: ${tenant.info.email}
            Phone: ${validator.formatPhoneNumber(tenant.info.phone)}
            Building: ${tenant.selectedUnit.property.info.address}
            Apt. of Interest: ${tenant.selectedUnit.unit}
            Anticipated Move-In Request: ${format(new Date(tenant.info.moveInRequest), 'dd/MM/yyyy')}
            Additional Notes: ${tenant.info.note}
          `;
    leasePage.drawText(leaseText, {
      x: 50,
      y: 350,
      size: 12,
      lineHeight: 15,
    });
    if (policyDoc) {
      const existingPdfPages = await leaseDetailsPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      existingPdfPages.forEach(page => leaseDetailsPdfDoc.addPage(page));
    }
    const finalPdfBytes = await leaseDetailsPdfDoc.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (err) {
    return;
  }
};

export default getLeaseAgreementPdf;
