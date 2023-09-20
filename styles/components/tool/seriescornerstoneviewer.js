// import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Theme } from '../../theme'

export const Wrapper = styled.div`
    width: 100%;
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
    box-shadow: 0px 2px 5px rgb(0 0 0 / 3%);
    position: relative;
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    overflow: hidden;
`

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%
    
`
export const Column = styled.div`
    flex-direction: column;
    width: ${({width}) => width ? width : 'auto'};
    height: ${({height}) => height ? height : 'auto'};
    border: 1px solid #303030;

`
export const Worklist = styled.div`
    height: 50px; 
    background: ${Theme.backgroundTitle};
    color: ${Theme.font};
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    padding: 0 9px;
    font-weight: 400;  
    cursor: pointer;
    &:hover {
        color: ${Theme.hover};
    }
    margin-left: 1px;
    border-radius: 5px 0 0 0;

`
export const Cornerstone = styled.div`
    flex: 1;
    overflow: hidden;
    width: 100%;
    height:100%;
		padding: 5px;
    cursor: auto !important;
    border:none;
    z-index: -1;
`

export const Information = styled.div`
    position: absolute;
    top: ${({top}) => top ? top : '75px'};
    left: ${({left}) => left ? left : '25px'};
    width: ${({width}) => width ? width : 'auto'};
    color: #000000;
    padding: 15px;
    font-size: 13px;
    background-color: #FFFFFF70;
    border-radius: 5px;
    overflow: hidden;
    user-select: none;
    z-index: 2;
    display: ${({isActive}) => isActive ? 'block' : 'none'};
`

export const Patient = styled.div`
  position: absolute;
  top: ${({ top }) => (top ? top : "75px")};
  left: ${({ left }) => (left ? left : "25px")};
  width: ${({ width }) => (width ? width : "auto")};
  font-size: ${({ fontsize }) => (fontsize ? fontsize : "1em")};
  color: #f6f7f8;
  margin-bottom: 7px;
  padding: 7px;
  border-radius: 5px;
  overflow: hidden;
  user-select: none;
  z-index: 2;
  display: ${({ isActive }) => (isActive ? "block" : "none")};
`;

export const InformationRow = styled.div`
    margin-bottom: 7px;
    &:last-child {
        margin-bottom: 0px;
    }
`

export const Orientation = styled.div`
    position: absolute;
    width: 40px;
    height: 40px;
    bottom: 25px;
    padding-bottom: 15px;
    right: 65px;
    color: #FFFFFF;
    font-size: 13px;
    /* background-color: #FFFFFF70; */
    border-radius: 50%;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    visibility: ${({orientationCode}) => orientationCode ? 'visible' : 'hidden'};
    &::after {
        content: '';
        position: absolute;
        background-color: #FF000070;
        width: ${({orientationCode}) => orientationCode !== 'S' ? '100%' : '1px'};
        height: ${({orientationCode}) => orientationCode !== 'A' ? 'calc(100% + 5px)' : '1px'};
        z-index: -1;
    }
`

export const OrientationText = styled.div`
    position: absolute;
    bottom: 0px;
    font-size: 5px;
`
export const Loading = styled.div`
    position: absolute;
    top: 35%;
    left:40%;
    
`
export const Spinner = styled.div`
    margin:5rem;
    position: absolute;
    border: 4px solid ${Theme.backgroundInactive};
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    &:nth-of-type(2) {
    animation-delay: -0.5s;
    }
    @keyframes lds-ripple {
        0% {
        top: 5rem;
        left: 5rem;
        width: 0;
        height: 0;
        opacity: 0;
        }
        4.9% {
        top: 5rem;
        left: 5rem;
        width: 0;
        height: 0;
        opacity: 0;
        }
        5% {
        top: 5rem;
        left: 5rem;
        width: 0;
        height: 0;
        opacity: 1;
        }
        100% {
        top: 0px;
        left: 0px;
        width: 10rem;
        height: 10rem;
        opacity: 0;
        }
    }
`
export const LoadingText = styled.span`
    font-size: 2.5rem;
    color: ${Theme.active};
    margin: 1rem;

`