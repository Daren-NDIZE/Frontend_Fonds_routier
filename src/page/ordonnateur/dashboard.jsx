import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend

} from "chart.js"
import { useEffect, useState } from "react";

import { Pie } from "react-chartjs-2"
import { fetchGet } from "../../config/FetchRequest";
import Loader from "../../component/loader";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);


function Dashboard (){

    let [synthese,setSynthese]=useState({})
    let [loader,setLoader]=useState(true)


    useEffect(()=>{

        (async function(){
    
            try{
                const res= await fetchGet('programme/statProgramme')
    
                if(res.ok){
                    const resData= await res.json()
                    setSynthese(resData)
                }
      
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }
        })()
    
    },[])


    if(loader){
        return(
            <Loader/>
        )
    }


    return(

        <div className="container">
            <div className="ac-title">
                <h1>Bienvenue sur PROGMA FR</h1>
            </div>

            {synthese.type==="GLOBAL"?
                <ChartFR prevision={synthese.prevision} engagement={synthese.engagement}/>
            :synthese.type==="MINTP"?
                <ChartMINTP prevision={synthese.prevision} engagement={synthese.engagement}/>
            :synthese.type==="MINT"?
                <ChartMINT prevision={synthese.prevision} engagement={synthese.engagement}/>
            :synthese.type==="MINHDU"?
            <ChartMINHDU prevision={synthese.prevision} engagement={synthese.engagement}/>
            :<></>
            }
            
        </div>
    )
}


export default Dashboard


const ChartFR=({engagement,prevision})=>{

    console.log(prevision)

    let totalP=prevision[0]+prevision[1]+prevision[2]
    let totalE=engagement[0]+engagement[1]+engagement[2]
    let taux=[(engagement[0]*100/prevision[0]).toFixed(2),(engagement[1]*100/prevision[1]).toFixed(2),(engagement[2]*100/prevision[2]).toFixed(2)]
    return(
        <div>
            <div className="chart-title">
                <h2>Taux d'engagement des différents ordonnateurs</h2>
            </div>

            <div className="chart-container">

                <div className="box chart-box">
                    <p>MINTP</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[0],100-taux[0]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>
                <div className="box chart-box">
                    <p>MINHDU</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[1],100-taux[1]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>
                <div className="box chart-box">
                    <p>MINT</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[2],100-taux[2]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

            </div>

        </div>
    )

}

const ChartMINTP=({engagement,prevision})=>{
    
    let totalP=prevision[0]+prevision[1]+prevision[2]
    let totalE=engagement[0]+engagement[1]+engagement[2]
    let taux=[(engagement[0]*100/prevision[0]).toFixed(2),
                (engagement[1]*100/prevision[1]).toFixed(2),
                (engagement[2]*100/prevision[2]).toFixed(2),
                (totalE*100/totalP).toFixed(2)
            ]
    return(
        <div>
            <div className="chart-title">
                <h2>Taux d'engagement du programme 2024</h2>
            </div>

            <div className="chart-container">

                <div className="box chart-box">
                    <p>GESTION CENTRALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[0],100-taux[0]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>
                <div className="box chart-box">
                    <p>GESTION REGIONALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[1],100-taux[1]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>
                <div className="box chart-box">
                    <p>GESTION COMMUNALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[2],100-taux[2]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

                <div className="box chart-box">
                    <p>GOLBAL</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[3],100-taux[3]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

            </div>

        </div>
    )

}

const ChartMINT=({engagement,prevision})=>{

    let totalP=prevision[0]+prevision[1] 
    let totalE=engagement[0]+engagement[1]
    let taux=[(engagement[0]*100/prevision[0]).toFixed(2),
                (engagement[1]*100/prevision[1]).toFixed(2),
                (totalE*100/totalP).toFixed(2)
            ]
    return(
        <div>
            <div className="chart-title">
                <h2>Taux d'engagement du programme 2024</h2>
            </div>

            <div className="chart-container">

                <div className="box chart-box">
                    <p>GLOBAL</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[2],100-taux[2]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

                <div className="box chart-box">
                    <p>GESTION CENTRALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[0],100-taux[0]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

                <div className="box chart-box">
                    <p>GESTION COMMUNALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[1],100-taux[1]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

            </div>

        </div>
    )

}

const ChartMINHDU=({engagement,prevision})=>{

    let totalP=prevision[0]+prevision[1]+prevision[2]+prevision[3] 
    let totalE=engagement[0]+engagement[1]+engagement[2]+engagement[3]
    let taux=[((engagement[0]+engagement[1])*100/(prevision[0]+prevision[1])).toFixed(2),
              ((engagement[2]+engagement[3])*100/(prevision[2]+prevision[3])).toFixed(2),
                    (totalE*100/totalP).toFixed(2)
            ]
    return(
        <div>
            <div className="chart-title">
                <h2>Taux d'engagement du programme 2024</h2>
            </div>

            <div className="chart-container">

                <div className="box chart-box">
                    <p>GLOBAL</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[2],100-taux[2]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

                <div className="box chart-box">
                    <p>GESTION CENTRALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[0],100-taux[0]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

                <div className="box chart-box">
                    <p>GESTION COMMUNALE</p>
                    <Pie data={{labels: ["taux d'engagement"],
                                datasets: [{data: [taux[1],100-taux[1]],
                                backgroundColor: ["blue","red"]}]}} 
                        height="100%"
                    />
                </div>

            </div>

        </div>
    )

}
 