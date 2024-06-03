import { forwardRef, useImperativeHandle, useState } from "react";


const ModalBox= forwardRef( function ({children},ref){
    
    let [visible,setVisible]=useState(false)

    useImperativeHandle(ref, ()=>({'setModal': setVisible}))

    const handleClick=(e)=>{
        setVisible(false)
        e.stopPropagation()
    }

    return(

        <>
            {visible && 
                (
                    <div className="modal-container" onClick={handleClick}>
    
                        <div className="modal-content" onClick={(e)=>{e.stopPropagation()}}>
                            <div className="m-close">
                                <i className="fa-solid fa-xmark" onClick={handleClick}></i>
                            </div>
                            {children}
                        </div>
                    </div>
                )
            }
        </>
        
    )
})

export default ModalBox;