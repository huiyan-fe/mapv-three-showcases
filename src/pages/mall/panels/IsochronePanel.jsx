import React from 'react';
import CustomCheckbox from '../components/CustomCheckbox';
import iconCar from '../assets/icons/car.png?url';
import iconBike from '../assets/icons/bike.png?url';
import iconWalk from '../assets/icons/walk.png?url';

function IsochronePanel({
    carVisible, bikeVisible, walkVisible,
    onCarVisibleChange, onBikeVisibleChange, onWalkVisibleChange,
}) {
    return (
        <>
            <CustomCheckbox
                checked={carVisible}
                onChange={onCarVisibleChange}
                icon={iconCar}
                color="#fbc02d"
            >
                驾车
            </CustomCheckbox>
            <CustomCheckbox
                checked={bikeVisible}
                onChange={onBikeVisibleChange}
                icon={iconBike}
                color="#fbc02d"
            >
                骑行
            </CustomCheckbox>
            <CustomCheckbox
                checked={walkVisible}
                onChange={onWalkVisibleChange}
                icon={iconWalk}
                color="#fbc02d"
            >
                步行
            </CustomCheckbox>
        </>
    );
}
export default IsochronePanel;