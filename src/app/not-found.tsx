"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <section className="page_404">
        <div className="container">
          <div className="row">	
            <div className="col-sm-12 ">
              <div className="col-sm-10 col-sm-offset-1 text-center">
                <div className="four_zero_four_bg">
                  <h1 className="text-center">404</h1>
                </div>
                
                <div className="contant_box_404">
                  <h3 className="h2">
                    Parece que você está perdido
                  </h3>
                  
                  <p>A página que você está procurando não está disponível!</p>
                  
                  <Link href="/" className="link_404">
                    Ir para o Início
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .page_404{ 
          padding:40px 0; 
          background:#fff; 
          font-family: 'Arvo', serif;
        }

        .page_404 img{ 
          width:100%;
        }

        .four_zero_four_bg{
          background-image: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif);
          height: 400px;
          background-position: center;
        }
        
        .four_zero_four_bg h1{
          font-size:80px;
        }
        
        .four_zero_four_bg h3{
          font-size:80px;
        }
        
        .link_404{			 
          color: #fff!important;
          padding: 10px 20px;
          background: #39ac31;
          margin: 20px 0;
          display: inline-block;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        
        .link_404:hover {
          background: #2d8a25;
          color: #fff!important;
          text-decoration: none;
        }
        
        .contant_box_404{ 
          margin-top:-50px;
        }

        /* Basic Bootstrap-like grid for this component */
        .container {
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -15px;
          margin-left: -15px;
        }
        .col-sm-12, .col-sm-10, .col-sm-offset-1 {
          position: relative;
          min-height: 1px;
          padding-right: 15px;
          padding-left: 15px;
        }
        .col-sm-12 {
          flex: 0 0 100%;
          max-width: 100%;
        }
        .col-sm-10 {
          flex: 0 0 83.333333%;
          max-width: 83.333333%;
        }
        .col-sm-offset-1 {
          margin-left: 8.333333%;
        }
        .text-center {
          text-align: center;
        }
      `}</style>
    </>
  );
}
