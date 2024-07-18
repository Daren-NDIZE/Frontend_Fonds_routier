import {Routes,Route,  useNavigate, Outlet, Navigate} from "react-router-dom"
import Login from "./page/login";
import { useEffect, useRef } from "react";
import Model from "./component/model";
import CreatePg from "./page/ordonnateur/newProgramme";
import Programme from "./page/ordonnateur/programme";
import ProgrammeMINT from "./page/ordonnateur/programmeMINT";
import ProgrammeMINTP from "./page/ordonnateur/programmeMINTP";
import UpdatePg from "./page/ordonnateur/updateProgramme";
import ProgrammeMINHDU from "./page/ordonnateur/programmeMINHDU";
import SubmitProgramme from "./page/FR/submitProgramme";
import ProgrammeFR from "./page/FR/programmeFR";
import ValidProgramme from "./page/FR/validProgramme.jsx";
import { decode } from "./script";
import Profil from "./page/profil";
import SuiviProgramme from "./page/FR/suiviProgramme";
import Synthese from "./page/FR/synthese";
import Cloturer from "./page/FR/cloturer";
import UserList from "./page/ADMIN/userList";
import PrevisionFR from "./page/FR/previsionFR";
import Prevision from "./page/ordonnateur/prevision";
import PaidProgramme from "./page/FR/paidProgramme";
import SuiviPayement from "./page/FR/suiviPayement";
import SuiviTravaux from "./page/suiviTravaux";
import ProgrammeCloture from "./page/ordonnateur/programmeCloture";
import ClotureDetails from "./page/FR/clotureDetails";
import ClotureDetail from "./page/ordonnateur/clotureDetail";
import PageNotFound from "./page/pageNotFound";


function App() {

  let user=decode(localStorage.getItem("token"))
  let navigate=useNavigate()

  let model=useRef()

  useEffect(()=>{
    if(user===null){
      localStorage.clear()
      navigate("/login")
    }
  },[user,navigate])

  return (

    <div className="main">
      {user===null?
        <Routes>
          <Route path="/login" element={<Login/> }/>
          <Route path="/*" element={<></>}/>
        </Routes>

      :
   
      <Model ref={model}>
        <Routes>
          <Route element={["FONDS_ROUTIER","ADMIN"].includes(user.role)?<Outlet/>:<Navigate to="/programmes"/>}>
            <Route path="/programmes/soumis" element={<SubmitProgramme/>}/>
            <Route path="/execution-des-programme" element={<ValidProgramme/>}/>
            <Route path="/execution-des-programme/programme-MINHDU/:id" element={<SuiviProgramme ordonnateur="MINHDU"/>}/>
            <Route path="/execution-des-programme/programme-MINT/:id" element={<SuiviProgramme ordonnateur="MINT"/>}/>
            <Route path="/execution-des-programme/programme-MINTP/:id" element={<SuiviProgramme ordonnateur="MINTP"/>}/>
            <Route path="/execution-des-programme/:ordonnateur/:id/prévision" element={<PrevisionFR/>}/>
            <Route path="/execution-des-programme/projet/:id/suivi-des-travaux" element={<SuiviTravaux/>}/>
            <Route path="/programmes/soumis/:id" element={<ProgrammeFR/>}/>
            <Route path="/synthese-programme" element={<Synthese/>}/>
            <Route path="/programmes-cloturés" element={<Cloturer/>}/>
            <Route path="/programmes-cloturés/:ordonnateur/:id" element={<ClotureDetails/>}/>
            <Route path="/suivi-des-payements" element={<PaidProgramme/>}/>
            <Route path="/suivi-des-payements/:ordonnateur/:id" element={<SuiviPayement/>}/>
          </Route>

          <Route element={user.role==="ADMIN"?<Outlet/>:<></>}>
            <Route path="/gestion-des-utilisateurs" element={<UserList/>}/>
          </Route>

          <Route element={!( ["FONDS_ROUTIER","ADMIN"].includes(user.role) )?<Outlet/>:<Navigate to="/programmes/soumis"/>}>
            <Route path="/créer-programme" element={<CreatePg/>}/>
            <Route path="/programmes" element={<Programme/>}/>
            <Route path="/modifier-programme/:id" element={<UpdatePg/>}/>
            <Route path="/programmes/:ordonnateur/:id/prévision" element={<Prevision/>}/>
            <Route path="/programmes/projet/:id/suivi-des-travaux" element={<SuiviTravaux update="true"/>}/>
            <Route path="/programmes_cloturés" element={<ProgrammeCloture/>}/>
            <Route path="/programmes_cloturés/:ordonnateur/:id" element={<ClotureDetail/>}/>

          </Route>

          <Route element={user.role==="MINHDU"?<Outlet/>:<></>}>
            <Route path="/programmes/programme-MINHDU/:id" element={<ProgrammeMINHDU/>}/>
          </Route>

          <Route element={user.role==="MINT"?<Outlet/>:<Navigate to="/programmes"/>}>
            <Route path="/programmes/programme-MINT/:id" element={<ProgrammeMINT/>}/>
          </Route>

          <Route element={user.role==="MINTP"?<Outlet/>:<Navigate to="/programmes/"/>}>
            <Route path="/programmes/programme-MINTP/:id" element={<ProgrammeMINTP/>}/>
          </Route>

          <Route path="/profil" element={<Profil header={model}/>}/>

          <Route path="/*" element={<PageNotFound/>}/>

          
          
        </Routes>
    </Model>

      }
    </div>
    
  );
}


// const Protected=({role})=>{

//   useEffect(()=>{
    
//     (async function(){

//       try{
//         const res= await fetchGet('profil')
//         if(res.ok){
//           const resData= await res.json()
//           setUser(resData)
//         }

//       }catch(e){
//         console.log(e)
//       }
//     })()

//   },[])
 
//   return(
//     <Outlet/>

//   )
// }

export default App;
