

function FormMINTP({title,body,categorie,annee}){

    return(
        <>
            <div className="mf-title">
                <h1>{title}</h1>
            </div>
            {body.data?
            <UpdateForm submit={body.function} categorie={categorie} annee={annee} data={body.data}/>
            :
            <Form submit={body.function} categorie={categorie} annee={annee} />
            }
        </>
    )
}

export default FormMINTP;

function Form({submit,categorie,annee}){

    return(
        <form className="flex-form" onSubmit={submit}>
            <div>
                <div className="form-line">
                    <label>Region <span>*</span></label>
                    <select  name="region" required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - -  </option>
                        <option value="CENTRE">CENTRE</option>
                        <option value="SUD">SUD</option>
                        <option value="EST">EST</option>
                        <option value="OUEST">OUEST</option>
                        <option value="LITTORAL">LITTORAL</option>
                        <option value="NORD">NORD</option>
                        <option value="NORD_OUEST">NORD-OUEST</option>
                        <option value="SUD_OUEST">SUD-OUEST</option>
                        <option value="ADAMAOUA">ADAMAOUA</option>
                        <option value="EXTRÊME_NORD">EXTRÊME-NORD</option>
                    </select>
                </div>
                {categorie==="COMMUNE" &&(
                <>
                    <div className="form-line">
                        <label>Département <span>*</span></label>
                        <input type="text" name="departement" required/>
                    </div> 
                    <input type="hidden" name="categorie" value="PROJET A GESTION COMMUNALE"/>
                    <div className="form-line">
                        <label>Commune <span>*</span></label>
                        <input type="text" name="commune" required/>
                    </div>
                </>
                )}
                
                <div className="form-line">
                    <label>Projets/troçons <span>*</span></label>
                    <textarea name="projet" required></textarea>
                </div>
                <div className="form-line">
                    <label>Catégorie <span>*</span></label>
                    <select name="categorie" required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - - </option>
                        {categorie==="CENTRALE"&&(
                            <option value="PROJET A GESTION CENTRALE">PROJET A GESTION CENTRALE</option>
                        )}
                        {categorie==="REGIONALE"&&(
                        <option value="PROJET A GESTION REGIONALE">PROJET A GESTION REGIONALE</option>
                        )}
                        {categorie==="COMMUNALE"&&(
                        <option value="PROJET A GESTION COMMUNALE">PROJET A GESTION COMMUNALE</option>
                        )}
                    </select>
                </div>

                {!categorie &&(
                <div className="form-line">
                    <label>Catégorie <span>*</span></label>
                    <select name="categorie" required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - - </option>
                        <option value="PROJET A GESTION CENTRALE">PROJET A GESTION CENTRALE</option>
                        <option value="PROJET A GESTION REGIONALE">PROJET A GESTION REGIONALE</option>
                        <option value="PROJET A GESTION COMMUNALE">PROJET A GESTION COMMUNALE</option>
                    </select>
                </div>
                )}
                
                <div className="form-line">
                    <label>Type de travaux <span>*</span></label>
                    <select  name="type_travaux" required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - - - - </option>
                        <option value="ROUTE BITUMÉE">ROUTE BITUMÉE</option>
                        <option value="ROUTE EN TERRE">ROUTE EN TERRE</option>
                        <option value="OUVRAGE D'ART">OUVRAGE D'ART</option>
                    </select>
                </div>
                
                <div className="form-line">
                    <label>Code route</label>
                    <input type="text" name="code_route" />
                </div>
                <div className="form-line">
                    <label>Linéaire route (km)</label>
                    <input type="number" name="lineaire_route" step="any"/>
                </div>
                <div className="form-line">
                    <label>Linéaire OA (ml)</label>
                    <input type="number" name="lineaire_oa" step="any"/>
                </div>
                
                
            </div>
            
            <div>
                <div className="form-line">
                    <label>Montant TTC <span>*</span></label>
                    <input type="number" name="ttc" required />
                </div>
                <div className="form-line">
                    <label>Budget antérieur</label>
                    <input type="number" name="budget_anterieur"/>
                </div>
                <div className="form-line">
                    <label>Budget {annee} <span>*</span></label>
                    <input type="number" name="budget_n" required/>
                </div>
                <div className="form-line">
                    <label>Budget {annee+1}</label>
                    <input type="number" name="budget_n1" />
                </div>
                <div className="form-line">
                    <label>Budget {annee+2}</label>
                    <input type="number" name="budget_n2" />
                </div>
                <div className="form-line">
                    <label>Prestataire</label>
                    <input type="text" name="prestataire" />
                </div>
                <div className="form-line">
                    <label>Observation</label>
                    <textarea name="observation" required></textarea>
                </div>
                <div className="form-line" style={{margin: "0"}}>
                    <button type="submit">Enregistrer</button>
                </div>
            </div>
        </form>
    )
}


function UpdateForm({submit,categorie,data,annee}){

    return(
        <form className="flex-form" onSubmit={(e)=>submit(e,data.id)}>
            <div>
                <div className="form-line">
                    <label>Region <span>*</span></label>
                    <select  name="region" defaultValue={data.region} required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - -  </option>
                        <option value="CENTRE">CENTRE</option>
                        <option value="SUD">SUD</option>
                        <option value="EST">EST</option>
                        <option value="OUEST">OUEST</option>
                        <option value="LITTORAL">LITTORAL</option>
                        <option value="NORD">NORD</option>
                        <option value="NORD_OUEST">NORD-OUEST</option>
                        <option value="SUD_OUEST">SUD-OUEST</option>
                        <option value="ADAMAOUA">ADAMAOUA</option>
                        <option value="EXTRÊME_NORD">EXTRÊME-NORD</option>
                    </select>
                </div>
                {categorie==="COMMUNE" &&(
                <>
                    <div className="form-line">
                        <label>Département <span>*</span></label>
                        <input type="text" name="departement" defaultValue={data.departement} required/>
                    </div> 
                    <input type="hidden" name="categorie" value="PROJET A GESTION COMMUNALE"/>
                    <div className="form-line">
                        <label>Commune <span>*</span></label>
                        <input type="text" name="commune" defaultValue={data.commune} required/>
                    </div>
                </>
                )}
                <div className="form-line">
                    <label>Projets/troçons <span>*</span></label>
                    <textarea name="projet" defaultValue={data.projet} required></textarea>
                </div>
                <div className="form-line">
                    <label>Catégorie <span>*</span></label>
                    <select name="categorie" defaultValue={data.categorie} required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - - </option>
                        {categorie==="CENTRALE"&&(
                            <option value="PROJET A GESTION CENTRALE">PROJET A GESTION CENTRALE</option>
                        )}
                        {categorie==="REGIONALE"&&(
                        <option value="PROJET A GESTION REGIONALE">PROJET A GESTION REGIONALE</option>
                        )}
                        {categorie==="COMMUNALE"&&(
                        <option value="PROJET A GESTION COMMUNALE">PROJET A GESTION COMMUNALE</option>
                        )}
                    </select>
                </div>
                
                <div className="form-line">
                    <label>Type de travaux <span>*</span></label>
                    <select  name="type_travaux" defaultValue={data.type_travaux} required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - - </option>
                        <option value="ROUTE BITUMÉE">ROUTE BITUMÉE</option>
                        <option value="ROUTE EN TERRE">ROUTE EN TERRE</option>
                        <option value="OUVRAGE D'ART">OUVRAGE D'ART</option>
                    </select>
                </div>
                
                <div className="form-line">
                    <label>Code route</label>
                    <input type="text" name="code_route" defaultValue={data.code_route} />
                </div>
                <div className="form-line">
                    <label>Linéaire route (km)</label>
                    <input type="number" name="lineaire_route" defaultValue={data.lineaire_route} step="any"/>
                </div>
                <div className="form-line">
                    <label>Linéaire OA (ml)</label>
                    <input type="number" name="lineaire_oa" defaultValue={data.lineaire_oa} step="any"/>
                </div>
                
            </div>
            
            <div>
                <div className="form-line">
                    <label>Montant TTC <span>*</span></label>
                    <input type="number" name="ttc" defaultValue={data.ttc} required />
                </div>
                <div className="form-line">
                    <label>Budget antérieur</label>
                    <input type="number" name="budget_anterieur" defaultValue={data.budget_anterieur}/>
                </div>
                <div className="form-line">
                    <label>Budget {annee} <span>*</span></label>
                    <input type="number" name="budget_n" defaultValue={data.budget_n} required/>
                </div>
                <div className="form-line">
                    <label>Budget {annee+1}</label>
                    <input type="number" name="budget_n1" defaultValue={data.budget_n1} />
                </div>
                <div className="form-line">
                    <label>Budget {annee+2}</label>
                    <input type="number" name="budget_n2" defaultValue={data.budget_n2} />
                </div>
                <div className="form-line">
                    <label>Prestataire</label>
                    <input type="text" name="prestataire" defaultValue={data.prestataire}/>
                </div>
                <div className="form-line">
                    <label>Observation</label>
                    <textarea name="observation"  defaultValue={data.observation} required></textarea>
                </div>
                <div className="form-line" style={{margin: "0"}}>
                    <button type="submit">Enregistrer</button>
                </div>
            </div>
        </form>
    )
}


// const type=["Projets phasés des programmes antérieurs","Axes routiers bitumés stratégiques","Projets contractualisés par anticipation","Projets nécessitant des ressources supplémentaires",
//             "Projets nouveaux","Protection du patrimoine routier","Travaux de cantonnage","Travaux à exécuter en régie","Contrôle des travaux"
//            ]
            