function getChoice(name){
    const statusRadios = document.getElementsByName(name);
    for (let statusRadio of statusRadios){
        if(statusRadio.checked){
            return statusRadio.value;
        }
    }
    return null;
}

function formatAnswer(condition){
    const guests = condition.guests === 0 ? 'only' :
        condition.guests === 1 ? 'and 1 guest' : `and ${condition.guests} guests`;


    return `<br>Entry to ${condition.lounge}<br>
    Passenger ${guests}.<br>
    `;
}

const getHighest = (conditions) => {
    for (let condition of conditions){
        
    }
}

const fetchConditions = async (set) => {
    return fetch('./data.json')
    .then(res => res.json())
    .then(data => data[set]);
}

const findMostGuests = (arr) => {
    const maxGuests = Math.max(...arr.map(item => item.guests));
    const returnArr = arr.filter(item => item.guests === maxGuests);
    return returnArr;
}

const claimPassInfo = async (status) => {
    // claim lounge passes
    const srcLink = 'https://www.cathaypacific.com/cx/en_HK/membership/benefits/mid-status-benefits/lounge-pass.html';
    const lp = await fetchConditions('claim');
    const lpStatusMatch = lp.find(l => l.status === status);
    if (!lpStatusMatch) return '';
    console.log(lpStatusMatch);
    return `
    <b><a href="${srcLink}" target="_blank">Claim lounge passes</a> (mid-tier benefit):</b>
    Upon gathering <span class="highlight">${lpStatusMatch.points_required} points</span>, ${lpStatusMatch.status} member can get <span class="highlight">${lpStatusMatch.number_of_passes} ${lpStatusMatch.number_of_passes === 1 ? 'pass' : 'passes'}</span> to ${lpStatusMatch.lounge} lounge for ${lpStatusMatch.eligibility}.
    Valid before flights marketed and operated by Cathay Pacific.
    `;
}

const purchasePassInfo = async (status) => {
    // purchase lounge passes
    const srcLink = 'https://www.cathaypacific.com/cx/en_HK/manage-booking/travel-extras/lounge-pass.html';
    const purchaseLp = await fetchConditions('purchase');
    const purchaseFindStatus = purchaseLp.find(l => l.status === status);
    if (!purchaseFindStatus) return '';
    console.log(purchaseFindStatus);
    if (status === 'green'){
        return `<b>Purchase lounge passes:</b>
        Not applicable for green members.
        `;
    }
    return `
    <b><a href="${srcLink}" target="_blank">Purchase lounge passes:</a></b>
    Eligible for ${purchaseFindStatus.eligibility} and departing on flights marketed and operated by Cathay.
    Available for <span class="highlight">${purchaseFindStatus.price}</span> on select airports: ${purchaseFindStatus.airports}.
    `;
}

const redeemPassInfo = async (status) => {
    // redeem lounge pass
    const srcLink = 'https://www.cathaypacific.com/content/cx/en_HK/frequent-flyers/redeem-asia-miles/flight-and-service-awards/redeem-worldwide-lounge-access.html';
    const redeemLp = await fetchConditions('redeem');
    const redeemFindStatus = redeemLp.find(l => l.status === status);
    if (!redeemFindStatus) return '';
    console.log(redeemFindStatus);
    if (status === 'green'){
        return `<b><a href="${srcLink}" target="_blank">Redeem lounge pass:</a></b>
        Not applicable for green members.
        `;
    }
    return `
    <b><a href="${srcLink}" target="_blank">Redeem lounge pass:</a></b>
    Eligible for ${redeemFindStatus.eligibility} and departing on flights with any airline.
    ${redeemFindStatus.first ? `First class lounges in ${redeemFindStatus.first.airports} for <span class="highlight">${redeemFindStatus.first.price}</span>.` : ''} 
    Business class lounges in ${redeemFindStatus.business.airports} for <span class="highlight">${redeemFindStatus.business.price}</span>.
    `;
}

const run = async () => {
    const status = getChoice('status');
    const cabin = getChoice('cabin');

    const conditions = await fetchConditions('default');

    const matches = conditions.filter(c => c.match.status === status || c.match.cabin === cabin);

    const first = matches.filter(m => m.rank === 2);
    const biz = matches.filter(m => m.rank === 1);

    console.log(first);
    console.log(biz);

    let outcome = '';
    const outputElement = document.querySelector('.default');
    const pass = document.querySelector('.pass ul');
    pass.innerHTML = '';

    switch(first.length) {
        case 0:
            // console.log('nothing in first');
            break;
        case 1:
            outcome += formatAnswer(first[0]) + '\n';
            break;
        default:
            console.log('more than 1 result in first');
            const element = findMostGuests(first);
            outcome += formatAnswer(first[0]) + '\n';
            break;
    }

    switch(biz.length){
        case 0:
            // console.log('nothing in biz');
            break;
        case 1:
            outcome += formatAnswer(biz[0]) + '\n';
            break;
        default:
            console.log('more than 1 result in biz');
            const element = findMostGuests(biz);
            outcome += formatAnswer(biz[0]) + '\n';
            break;
    }


    



    if (outcome === ''){
        outputElement.classList.remove('positive', 'neutral', 'negative');
        outputElement.classList.add('negative');
        outputElement.innerHTML =
        `No complimentary Cathay lounge access.<br>

        Buy access to external lounges / shower / private resting area (nap room) on <a href="https://www.plazapremiumlounge.com" target="_blank">plazapremiumlounge.com</a>
        `;
    } else {
        const admitLink = 'https://www.cathaypacific.com/cx/en_HK/destinations/lounges/all-lounges-admittance.html';
        outcome = `<a href="${admitLink}" target="_blank"><h4>Lounge Admittance</h4></a>` + outcome;
    
        outputElement.innerHTML = outcome;
        outputElement.classList.remove('positive', 'neutral', 'negative'); 
        outputElement.classList.add('positive');
    }

    const claimContent = await claimPassInfo(status);
    const purchaseContent = await purchasePassInfo(status);
    const redeemContent = await redeemPassInfo(status);

    pass.innerHTML += claimContent.length === 0 ? '' : `<li>${claimContent}</li>`;
    pass.innerHTML += purchaseContent.length === 0 ? '' : `<li>${purchaseContent}</li>`;
    pass.innerHTML += redeemContent.length === 0 ? '' : `<li>${redeemContent}</li>`;

    if (pass.innerText.length > 0){
        pass.innerHTML = '<h3>Additional options:</h3><br>' + pass.innerHTML;
    }
}

const reset = () => {
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    for (let radioButton of radioButtons){
        radioButton.checked = false;
    }
    const outputElement = document.querySelector('.default');
    outputElement.classList.remove('positive', 'neutral', 'negative'); 
    outputElement.innerHTML = '';
    const passElement = document.querySelector('.pass ul');
    passElement.innerHTML = '';
}