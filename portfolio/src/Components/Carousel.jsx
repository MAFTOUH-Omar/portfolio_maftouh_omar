import React, { useState } from 'react';
import Azure from '../Icons/Azur.png'; // Example icon
import Bootstrap from '../Icons/bootstrap.png'; // Example icon
import Css from '../Icons/css.png'; // Example icon
import Docker from '../Icons/docker.png'; // Example icon
import Express from '../Icons/expressjs.png'; // Example icon
import Figma from '../Icons/figma.png'; // Example icon
import Git from '../Icons/git.png'; // Example icon
import Html from '../Icons/html5.png'; // Example icon
import JavaScript from '../Icons/javascript.png'; // Example icon
import Jira from '../Icons/jira.png'; // Example icon
import MongoDb from '../Icons/mongodb.png'; // Example icon
import NodeJS from '../Icons/nodejs.png'; // Example icon
import Php from '../Icons/php.png'; // Example icon
import ReactJs from '../Icons/reactjs.png'; // Example icon
import Redux from '../Icons/redux.png'; // Example icon
import TailwindCss from '../Icons/tailwindcss.png'; // Example icon
import Woocomrce from '../Icons/woocommerce.png'; // Example icon
import Wordpress from '../Icons/wordpress.png'; // Example icon
import Autre from '../Icons/autre.png'; // Example icon
import Image from 'next/image';
function Carousel(){
  return(
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Azure} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Azure</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Bootstrap} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Bootstrap</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Css} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Css</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Docker} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Docker</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Express} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Express</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Figma} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Figma</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Git} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Git</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Html} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Html</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={JavaScript} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>JavaScript</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Jira} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Jira</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={MongoDb} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>MongoDb</span>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={NodeJS} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>NodeJS</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Php} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>php</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={ReactJs} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>ReactJs</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Redux} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Redux</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={TailwindCss} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Tailwind</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Woocomrce} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>WooC</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Wordpress} style={{width:'100px',height:'100px'}} alt="" /><br/>
          <span className='badge bg-success form-control'>Wordpress</span>
        </div>
        <div className="col-md-1 col-3 mx-1 mb-3">
          <Image className="img-fluid" src={Autre} style={{width:'100px',height:'100px'}} alt="" />
        </div>
      </div>
    </div>
  )
};

export default Carousel;
