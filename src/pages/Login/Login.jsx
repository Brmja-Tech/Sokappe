import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Login = () => {
    const {t,i18n} = useTranslation('global');
    return (
        <div className='registration_forms py-4' style={{backgroundImage: "url('/login-bg.jpg')"}}>
            <form>
                <img className='logo' src="/logo-white.png" alt="--" />
                <h5 className='text-center mt-2 mb-3 fw-bold'>{t("sign.login")}</h5>
                <div className='text-sm text-center'>
                    <span>{t("sign.noAccount")}</span>
                    <span className='fw-bold mx-1'>{t("sign.createAccount")}</span>
                </div>
                <label>{t("sign.email")}</label>
                <input autoComplete='off' type="email" name="email" placeholder={t("sign.email")} />
                <label>{t("sign.password")}</label>
                <input autoComplete='off' type="password" name="password" placeholder={t("sign.password")} />
                <div className='my-2'>
                    <Link className='main-color text-sm'> {t("sign.forgotPassword")} </Link>
                </div>
                <div className='text-center'>
                    <button type='submit'>{t("sign.login")}</button>
                </div>
            </form>
        </div>
    );
}

export default Login;
