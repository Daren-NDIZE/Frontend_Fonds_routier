import SearchBar from "../../component/searchBar";
import { numStr } from "../../script";


function Cloturer(){

    return(
        <div className="container">
            <div className="box b-search">
                <SearchBar/>
            </div>
            <div className="box">
                <div id="pg-title" className="mb-25">
                    <h1>programmes cloturés</h1>
                </div>
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Intitulé</th>
                                <th>Ordonnateur</th>
                                <th>année</th>
                                <th>Budget</th>
                                <th>résolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Programme MINTP 2024</td>
                                <td>MINTP</td>
                                <td>2024</td>
                                <td>{numStr(28500480000)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Programme MINT 2024</td>
                                <td>MINT</td>
                                <td>2024</td>
                                <td>{numStr(2850048000)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Programme MINHDU 2024</td>
                                <td>MINHDU</td>
                                <td>2024</td>
                                <td>{numStr(3556528000)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Programme MINTP 2023</td>
                                <td>MINTP</td>
                                <td>2023</td>
                                <td>{numStr(2850048000)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Cloturer;