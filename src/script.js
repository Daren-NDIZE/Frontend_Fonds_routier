import { jwtDecode } from "jwt-decode";

function Unite( nombre ){
	var unite;
	switch( nombre ){
		case 0: unite = "zéro";		break;
		case 1: unite = "un";		break;
		case 2: unite = "deux";		break;
		case 3: unite = "trois"; 	break;
		case 4: unite = "quatre"; 	break;
		case 5: unite = "cinq"; 	break;
		case 6: unite = "six"; 		break;
		case 7: unite = "sept"; 	break;
		case 8: unite = "huit"; 	break;
		case 9: unite = "neuf"; 	break;
        default: break;
	}//fin switch
	return unite;
}//-----------------------------------------------------------------------

function Dizaine( nombre ){
    var dizaine;
	switch( nombre ){
		case 10: dizaine = "dix"; break;
		case 11: dizaine = "onze"; break;
		case 12: dizaine = "douze"; break;
		case 13: dizaine = "treize"; break;
		case 14: dizaine = "quatorze"; break;
		case 15: dizaine = "quinze"; break;
		case 16: dizaine = "seize"; break;
		case 17: dizaine = "dix-sept"; break;
		case 18: dizaine = "dix-huit"; break;
		case 19: dizaine = "dix-neuf"; break;
		case 20: dizaine = "vingt"; break;
		case 30: dizaine = "trente"; break;
		case 40: dizaine = "quarante"; break;
		case 50: dizaine = "cinquante"; break;
		case 60: dizaine = "soixante"; break;
		case 70: dizaine = "soixante-dix"; break;
		case 80: dizaine = "quatre-vingt"; break;
		case 90: dizaine = "quatre-vingt-dix"; break;
        default: break;
	}//fin switch
	return dizaine;
}//-----------------------------------------------------------------------

export function NumberToLetter( nombre ){
	var  n, quotient, reste, nb ;
	var numberToLetter='';
	//__________________________________
	
	if( nombre.toString().replace( / /gi, "" ).length > 15 )	return "dépassement de capacité";
	if(  isNaN(nombre.toString().replace( / /gi, "" ))    )		return "Nombre non valide";
    if( nombre < 0 )     return "Non valide"

	nb = parseFloat(nombre.toString().replace( / /gi, "" ));
	if(  Math.ceil(nb) !== nb  )	return  "";
	
	n = nb.toString().length;
	switch( n ){
		 case 1: numberToLetter = Unite(nb); break;
		 case 2: if(  nb > 19  ){
					   quotient = Math.floor(nb / 10);
					   reste = nb % 10;
					   if(  nb < 71 || (nb > 79 && nb < 91)  ){
							 if(  reste === 0  ) numberToLetter = Dizaine(quotient * 10);
							 if(  reste === 1  ) numberToLetter = Dizaine(quotient * 10) + "-et-" + Unite(reste);
							 if(  reste > 1   ) numberToLetter = Dizaine(quotient * 10) + "-" + Unite(reste);
					   }else numberToLetter = Dizaine((quotient - 1) * 10) + "-" + Dizaine(10 + reste);
				 }else numberToLetter = Dizaine(nb);
				 break;
		 case 3: quotient = Math.floor(nb / 100);
				 reste = nb % 100;
				 if(  quotient === 1 && reste === 0   ) numberToLetter = "cent";
				 if(  quotient === 1 && reste !== 0   ) numberToLetter = "cent " + NumberToLetter(reste);
				 if(  quotient > 1 && reste === 0    ) numberToLetter = Unite(quotient) + " cents";
				 if(  quotient > 1 && reste !== 0    ) numberToLetter = Unite(quotient) + " cent " + NumberToLetter(reste);
				 break;
		 case 4 :  quotient = Math.floor(nb / 1000);
					  reste = nb - quotient * 1000;
					  if(  quotient === 1 && reste === 0   ) numberToLetter = "mille";
					  if(  quotient === 1 && reste !== 0   ) numberToLetter = "mille " + NumberToLetter(reste);
					  if(  quotient > 1 && reste === 0    ) numberToLetter = NumberToLetter(quotient) + " mille";
					  if(  quotient > 1 && reste !== 0    ) numberToLetter = NumberToLetter(quotient) + " mille " + NumberToLetter(reste);
					  break;
		 case 5 :  quotient = Math.floor(nb / 1000);
					  reste = nb - quotient * 1000;
					  if(  quotient === 1 && reste === 0   ) numberToLetter = "mille";
					  if(  quotient === 1 && reste !== 0   ) numberToLetter = "mille " + NumberToLetter(reste);
					  if(  quotient > 1 && reste === 0    ) numberToLetter = NumberToLetter(quotient) + " mille";
					  if(  quotient > 1 && reste !== 0    ) numberToLetter = NumberToLetter(quotient) + " mille " + NumberToLetter(reste);
					  break;
		 case 6 :  quotient = Math.floor(nb / 1000);
					  reste = nb - quotient * 1000;
					  if(  quotient === 1 && reste === 0   ) numberToLetter = "mille";
					  if(  quotient === 1 && reste !== 0   ) numberToLetter = "mille " + NumberToLetter(reste);
					  if(  quotient > 1 && reste === 0    ) numberToLetter = NumberToLetter(quotient) + " mille";
					  if(  quotient > 1 && reste !== 0    ) numberToLetter = NumberToLetter(quotient) + " mille " + NumberToLetter(reste);
					  break;
		 case 7: quotient = Math.floor(nb / 1000000);
					  reste = nb % 1000000;
					  if(  quotient === 1 && reste === 0  ) numberToLetter = "un million";
					  if(  quotient === 1 && reste !== 0  ) numberToLetter = "un million " + NumberToLetter(reste);
					  if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " millions";
					  if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " millions " + NumberToLetter(reste);
					  break;  
		 case 8: quotient = Math.floor(nb / 1000000);
					  reste = nb % 1000000;
					  if(  quotient === 1 && reste === 0  ) numberToLetter = "un million";
					  if(  quotient === 1 && reste !== 0  ) numberToLetter = "un million " + NumberToLetter(reste);
					  if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " millions";
					  if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " millions " + NumberToLetter(reste);
					  break;  
		 case 9: quotient = Math.floor(nb / 1000000);
					  reste = nb % 1000000;
					  if(  quotient === 1 && reste === 0  ) numberToLetter = "un million";
					  if(  quotient === 1 && reste !== 0  ) numberToLetter = "un million " + NumberToLetter(reste);
					  if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " millions";
					  if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " millions " + NumberToLetter(reste);
					  break;  
		 case 10: quotient = Math.floor(nb / 1000000000);
						reste = nb - quotient * 1000000000;
						if(  quotient === 1 && reste === 0  ) numberToLetter = "un milliard";
						if(  quotient === 1 && reste !== 0  ) numberToLetter = "un milliard " + NumberToLetter(reste);
						if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " milliards";
						if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " milliards " + NumberToLetter(reste);
					    break;	
		 case 11: quotient = Math.floor(nb / 1000000000);
						reste = nb - quotient * 1000000000;
						if(  quotient === 1 && reste === 0  ) numberToLetter = "un milliard";
						if(  quotient === 1 && reste !== 0  ) numberToLetter = "un milliard " + NumberToLetter(reste);
						if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " milliards";
						if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " milliards " + NumberToLetter(reste);
					    break;	
		 case 12: quotient = Math.floor(nb / 1000000000);
						reste = nb - quotient * 1000000000;
						if(  quotient === 1 && reste === 0  ) numberToLetter = "un milliard";
						if(  quotient === 1 && reste !== 0  ) numberToLetter = "un milliard " + NumberToLetter(reste);
						if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " milliards";
						if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " milliards " + NumberToLetter(reste);
					    break;	
		 case 13: quotient = Math.floor(nb / 1000000000000);
						reste = nb - quotient * 1000000000000;
						if(  quotient === 1 && reste === 0  ) numberToLetter = "un billion";
						if(  quotient === 1 && reste !== 0  ) numberToLetter = "un billion " + NumberToLetter(reste);
						if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " billions";
						if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " billions " + NumberToLetter(reste);
					    break; 	
		 case 14: quotient = Math.floor(nb / 1000000000000);
						reste = nb - quotient * 1000000000000;
						if(  quotient === 1 && reste === 0  ) numberToLetter = "un billion";
						if(  quotient === 1 && reste !== 0  ) numberToLetter = "un billion " + NumberToLetter(reste);
						if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " billions";
						if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " billions " + NumberToLetter(reste);
					    break; 	
		 case 15: quotient = Math.floor(nb / 1000000000000);
						reste = nb - quotient * 1000000000000;
						if(  quotient === 1 && reste === 0  ) numberToLetter = "un billion";
						if(  quotient === 1 && reste !== 0  ) numberToLetter = "un billion " + NumberToLetter(reste);
						if(  quotient > 1 && reste === 0   ) numberToLetter = NumberToLetter(quotient) + " billions";
						if(  quotient > 1 && reste !== 0   ) numberToLetter = NumberToLetter(quotient) + " billions " + NumberToLetter(reste);
					    break; 
         default:break;	
	 }//fin switch
	 /*respect de l'accord de quatre-vingt*/
	 if(  numberToLetter.substr(numberToLetter.length-"quatre-vingt".length,"quatre-vingt".length) === "quatre-vingt"  ) numberToLetter = numberToLetter + "s";
	 
	 return numberToLetter;
}

export function numStr(a, b) {

	if((a===0 || a==="0") && b===0){
		return 0
	}

	if(a===0 || a==="0" || a===null || a===undefined){
		return ""
	}
		
	a=Number(a).toLocaleString("fr-FR").replace(/\s/g,"  ")
	
	// a = '' + a;
	// b = ' ';
	// var c = '',
	// 	d = 0;
	// while (a.match(/^0[0-9]/)) {
	//   a = a.substr(1);
	// }
	// for (var i = a.length-1; i >= 0; i--) {
	//   c = (d !== 0 && d % 3 === 0) ? a[i] + b + c : a[i] + c;
	//   d++;
	// }
	return a;
  }

export function totalBudget(projet,prevision){

	let total
	if(prevision){
		total=parseInt(prevision);
	}else{
		total=0
	}

projet.forEach(i =>{
	total=total + parseInt(i.budget_n) 
});

return total
}

export function totalEngagement(projet){

	let total=0
	

projet.forEach(i =>{

	if(projet.suivi){
		total=total + parseInt(i.suivi.totalEngagement) 
	}
});

return total
}

export function totalPayement(payement, attribut){

	let total=0;
	if(payement.length>0){

		payement.forEach(i=>{
			total=total + i[attribut]
		})
	}

	return total
}

export function decode(token){

try{

return	jwtDecode(token)

}catch(e){
	return null
}
}

export function parseTable(motif){

	let table=[]

	let motifs=motif ||""
	
	if(motifs.length>0){
		table=motifs.split(';')
		table.pop()
	}

	return table;
}


export function cursorLine(){

	let lines=document.querySelectorAll("tbody tr")

	Array.from(lines).forEach((i)=>{

		i.addEventListener("dblclick",function(){

			Array.from(lines).forEach((i)=>{
				i.classList.remove("lineFocus")
			})

			i.classList.add("lineFocus")
		})

	})
}


export const Rejet=[{label:"La non inscription du projet dans la programmation validée" ,value:"La non inscription du projet dans la programmation validée" },
				{label:"La non désignation du Fonds Routier comme payeur",value:"La non désignation du Fonds Routier comme payeur" },
				{label:"L'absence de procès verbal de proposition d'attribution" ,value:"L'absence de procès verbal de proposition d'attribution" },
				{label:"L'absence du procès-verbal de réception provisoire de la tranche précédente pour les marchés pluriannuels" ,value:"L'absence du procès-verbal de réception provisoire de la tranche précédente pour les marchés pluriannuels" },
				{label:"La non conformité des dispositions fiscales (TVA, AIR, droit d'enregistrement)" ,value:"La non conformité des dispositions fiscales (TVA, AIR, droit d'enregistrement)" },
				{label:"L'inexactitude de la structure du compte bancaire à 23 chiffres" ,value:"L'inexactitude de la structure du compte bancaire à 23 chiffres" },
				{label:"Les erreurs sur le montant du marché" ,value:"Les erreurs sur le montant du marché" },
				{label:"La non désignation de l'autorité chargée de l'ordonnancement et de la liquidation de la dépense" ,value:"La non désignation de l'autorité chargée de l'ordonnancement et de la liquidation de la dépense" },
				{label:"L'absence du spécimen des signatures" ,value:"L'absence du spécimen des signatures" },
				{label:"L'absence d'au moins un représentant des populations bénéficiaires dans la commission de réception" ,value:"L'absence d'au moins un représentant des populations bénéficiaires dans la commission de réception" },
				{label:"Le changement de tronçons sans autorisation du MINTP et/ou du MINMAP" ,value:"Le changement de tronçons sans autorisation du MINTP et/ou du MINMAP" },
				{label:"L'absence de montant sur les ordres de service de démarrage des tranches conditionnelles" ,value:"L'absence de montant sur les ordres de service de démarrage des tranches conditionnelles" },
				{label:"La mauvaise présentation des marchés à tranche" ,value:"La mauvaise présentation des marchés à tranche" },
				{label:"L'absence de l'autorisation de gré à gré" ,value:"L'absence de l'autorisation de gré à gré" },
				{label:"La non présentation des passes pour les marchés de cantonnage" ,value:"La non présentation des passes pour les marchés de cantonnage" },
				{label:"L'absence de précision relative au visa préalable du MINMAP sur le décompte général et définitif" ,value:"L'absence de précision relative au visa préalable du MINMAP sur le décompte général et définitif" },
				{label:"L'absence du bordereau des prix unitaires" ,value:"L'absence du bordereau des prix unitaires" }
				]


export const selectValue=(motif)=>{

	let value="";

	motif.forEach(i=>{

		value=` ${i.value}; ${value}`
		
	})

	return value;
}