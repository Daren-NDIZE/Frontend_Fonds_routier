import SideBar from "./sideBar";

import Header from "./header";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetchGet } from "../config/FetchRequest";


const Model=forwardRef(function ({children},ref){

    let [user,setUser]=useState({role:{}})
    let [bar,setBar]=useState(true)

    useImperativeHandle(ref, ()=>({'updateUser': setUser}))

    const slideBar=()=>{
        if(bar){
            setBar(false)

        }else{
            setBar(true)
        }
    }

    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet('profil')
                if(res.ok){
                    const resData= await res.json()
                    setUser(resData)
                }
      
            }catch(e){
                console.log(e)
            }
          })()
    },[])
    
    return(
        <>  {bar &&(
            <div className="left-content">
                <SideBar role={user.role.roleName}/>
            </div>
            )}
            <div className="right-content" >
                <Header user={user} bar={bar} onSlideBar={slideBar}/>
                {children}
            </div>
        </>  
    )
    
})

export default Model;
