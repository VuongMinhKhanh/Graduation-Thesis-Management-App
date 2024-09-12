export default function calculateTotalScore(tableData) { // wrong result
    let totalWeightedScore = 0;
    let totalWeight = 0;

    tableData.forEach(item => {
        const weight = parseFloat(item.ty_le) / 100; // Convert ty_le to a decimal
        const score = item.diem;
        totalWeightedScore += score * weight;
        totalWeight += weight;
    });
    // console.info(totalWeight, totalWeightedScore)
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
}

export const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
};


// export default calculateTotalScore;