import React from 'react'
import './personal_page.css'


const PersonalPage:React.FC = () =>{
    return (
        <a href='https://linwe2012.github.io/personal-page'>
        <div className='personal-page-wrap-white'>
            <img className='personal-page-avatar-white' src='https://linwe2012.github.io/personal-page/static/img/me-removebg-preview-sqr.svg' alt=''></img>
            <div className='personal-page-text-white'>Lin's Personal Page</div>
        </div>
        </a>
    )
}

export default PersonalPage;