About this project:
This project currently aims to monitor crypto prices on Binance & FTX (futures & stock tokens could also be monitored for FTX).
The project began with the aim to perform arbitrage trades across Binance & FTX, which the functionality has succeeded and currently abandoned. There is no plan for continuous maintainence for the functionality and it has been hidden from the UI. Developers with interest may explore that in the source code as I find it troublesome to remove them from the project.

How to use:
- Alarms in the format of ">= (value)", "<= (value)", ">= high" and "<= low" could be used to get notice once the price has reached a certain value or the 24-hrs high/low.
- To use custom names for pronouncing the coin/stock symbols, open the "data/speechDictionary.csv" to add a custom "(symbol), (name)" pair.
- If you need to re-order the lists, or moving list items across lists, you may need to manually modify the "data/coinListsConfig.txt".

Known issues:
- If the program freezes occasionally, it could be caused by having too much entries for monitoring FTX markets. Try to remove/archieve some (or most) of the FTX entries to see if the problem is resolved.

Disclaimer:
The application only reflects the data fetched from the exchanges without any implication nor advice. Any issues causing the application to freeze, fail or reflecting corrupted data would be unintended and the developer will not be liable to any loss caused. Please use the application based on your own decision by which you should be solely responsible for any possible consequence. Please be careful when making investment decisions and beware of the risks behind.



====================== Download ======================

1) Download and unzip the "TradingLobby.7z"：
https://github.com/samuelykc/TradingLobby/releases/tag/v1.0

2) Start "TradingLobby.exe" within.
If you are trying it in workplace, you may want to mute the speaker beforehand just to ensure the example price alarms would not catch the others' attention.

The folder has included the example data files used by the application ("data/coinListsConfig.txt", "data/speechDictionary.csv"), usually you don't have to manually modify them but could interact through the UI. Developers working with the source codes may want to refer to the example data files.



====================== Referral ======================

If you are planning to join Binance or FTX, please consider the following referral links with commission kickback.

Binance：
https://www.binance.com/en/register?ref=TZL78JU8

FTX：
https://ftx.com/#a=15008914



====================== Donation ======================

If you do make a fortune perhaps with a little bit of help from the app, feel free to share your joy into any of the following addresses. I am always here to celebrate with you.

BTC：
bc1q3pjvm4txwl6ezl2pju6035npyv2jl20x5xa9s5

ETH (BEP20/BSC)：
0xCc56Dc8AF3792b856428E5d62462f7bA15e064a1

BNB (BEP2)：
bnb1e55cpc0ucw9g2gy3htkq6jf6as8ftz0waq6qxv

BNB (BEP20/BSC)：
0xCc56Dc8AF3792b856428E5d62462f7bA15e064a1

FTT (BEP20/BSC)：
0xCc56Dc8AF3792b856428E5d62462f7bA15e064a1

DOGE：
D85cgdjqXv8tABPsDFWazt91KqY4zUVCp3

SOL：
FtcJuxkA1xpThArxUr843urXuLhaHB5pMkyCN6PvW4N

Tether USD (BEP20/BSC)：
0xCc56Dc8AF3792b856428E5d62462f7bA15e064a1



====================== Dev ======================

Test:
npm start


Prepare for deploy:
npm install --save-dev @electron-forge/cli
npx electron-forge import

Deploy:
npm run make



====================== The MIT License ======================
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
Copyright 2021 samuelykc (https://github.com/samuelykc)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

