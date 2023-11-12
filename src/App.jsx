import { useEffect, useState, useRef } from 'react';
import './App.css';

//create your forceUpdate hook

function App() {
  const [inputString, setInputString] = useState('');
  const [fixedInputString, setFixedInputString] = useState('');
  const [lineHeights, setLineHeights] = useState([]);
  const [styleIndices, setStyleIndices] = useState([]);
  const [startPositions, setStartPositions] = useState([]);
  const [error, setError] = useState('');
  const [startSearch, setStartSearch] = useState(false);
  const [isHidden, setIsHidden] = useState('hidden');
  const fixedCodeRef = useRef();

  const handleInputChange = (event) => {
    setFixedInputString('');
    setStartSearch(false);
    setError('');
    setLineHeights([]);
    setStyleIndices([]);
    setStartPositions([]);
    setInputString(event.target.value);
  };
  console.log(error.length);
  const handleRegexMatch = () => {
    setStartSearch(true);
    setError('');
    setLineHeights([]);
    const regexPattern = /(<td)/g;
    let match;
    const foundMatches = [];

    while ((match = regexPattern.exec(inputString)) !== null) {
      foundMatches.push(match.index);
    }
    setStartPositions(foundMatches);
  };

  useEffect(() => {
    if (startPositions.length === 0 && startSearch === true) {
      setError("No <td>'s found");
      return;
    }
    const searchString = 'mso-line-height-alt:';
    const indexOfSubstringMap = {}; // Object to store unique indexOfSubstring values

    startPositions.forEach((startPosition) => {
      const indexOfSubstring = inputString.indexOf(searchString, startPosition);

      if (indexOfSubstring !== -1) {
        indexOfSubstringMap[indexOfSubstring] = startPosition;
      }
    });

    // Extract the last occurrence of each unique indexOfSubstring and its corresponding startPosition
    const uniqueLineHeights = Object.keys(indexOfSubstringMap).map(
      (indexOfSubstring) => {
        const codeString =
          inputString.substring(
            parseInt(indexOfSubstring),
            parseInt(indexOfSubstring) + 25
          )[24] === ';'
            ? inputString.substring(
                parseInt(indexOfSubstring),
                parseInt(indexOfSubstring) + 25
              )
            : inputString.substring(
                parseInt(indexOfSubstring),
                parseInt(indexOfSubstring) + 25
              ) + ';';
        console.log(lineHeights);
        return {
          index: parseInt(indexOfSubstring),
          td: indexOfSubstringMap[indexOfSubstring],
          tdText: inputString.substring(
            indexOfSubstringMap[indexOfSubstring],
            indexOfSubstringMap[indexOfSubstring] + 60
          ),
          code: codeString,
          // inputString.substring(
          //   parseInt(indexOfSubstring),
          //   parseInt(indexOfSubstring) + 25
          // ),
        };
      }
    );
    setLineHeights(uniqueLineHeights);
    if (uniqueLineHeights.length === 0 && startSearch === true) {
      setError("No mso-line-height-alt's found");
      return;
    }
  }, [startPositions]);

  useEffect(() => {
    if (lineHeights.length !== 0) {
      const indexOfStyleMap = []; // Object to store unique indexOfSubstring values

      lineHeights.forEach((object) => {
        const index = inputString.indexOf('style="', object.td);
        indexOfStyleMap.push({
          styleIndex: index,
          code: object.code,
          styleText: inputString.substring(index, index + 60),
        });
      });

      setStyleIndices(indexOfStyleMap);
    }
  }, [lineHeights, inputString]);

  useEffect(() => {
    if (styleIndices.length !== 0) {
      let newInput = inputString;
      let compoundValue = 0;
      console.log(styleIndices);
      styleIndices.forEach((object) => {
        compoundValue += object.code.length;
        newInput =
          newInput.slice(
            0,
            object.styleIndex + compoundValue - object.code.length + 7
          ) +
          object.code +
          newInput.slice(
            object.styleIndex + compoundValue - object.code.length + 7
          );
      });
      setFixedInputString(newInput);
    }
    setStartSearch(false);
  }, [styleIndices]);

  function copyCode() {
    navigator.clipboard.writeText(fixedCodeRef.current.value);
    setIsHidden('');
    setTimeout(() => {
      setIsHidden('hidden');
    }, 3000);
  }

  return (
    <div>
      <div>
        <h1>mso-line-height-alt Fixer</h1>
        <h6>by: Ryan Johnson</h6>
      </div>
      <div className="input">
        <textarea
          type="text"
          value={inputString}
          onChange={handleInputChange}
          rows={10}
          placeholder="Paste code here..."
        />
        <button className="applyButton" onClick={handleRegexMatch}>
          Apply Line Heights
        </button>
      </div>
      {error.length > 0 && (
        <div>
          <p className="errorMessage">Error: {error}</p>
        </div>
      )}
      <div className="output">
        {fixedInputString.length !== 0 && (
          <div>
            <h3>Fixed Code:</h3>
            <div className="textareaContainer">
              <div className={`copyPopup ${isHidden}`}>
                <h4>Copied</h4>
              </div>
              <textarea
                value={fixedInputString}
                rows={10}
                readOnly={true}
                ref={fixedCodeRef}
              />
            </div>
            <button onClick={copyCode}>
              Copy Code <i className="fa-regular fa-copy"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
