import React from 'react'
import { useTranslation } from 'react-i18next'
import PageHead from '../../component/PageHead/PageHead';
import Services from '../../component/Services/Services';
import ProductsServices from '../../component/ProductsServices/ProductsServices';


export default function RequestService() {
    const { t, i18n } = useTranslation("global");

  return <>
    <PageHead header={t("OfferRequestService.requestBtn")}/>
    <Services/>
    <ProductsServices tittle={t("products.ouroffers")} status = {true}  ouroffers = {true}/>
    <ProductsServices tittle={t("products.bestseller")}  status = {true}/>
  </>
  
  
}
