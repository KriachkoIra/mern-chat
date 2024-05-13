export default function BackgroundToolbar({ setBg }) {
  const handleClick = function (n) {
    setBg(n);
  };

  return (
    <div className="bg-toolbar p-2">
      <button
        style={{ backgroundImage: `url("img/1.jpg")` }}
        onClick={() => handleClick(1)}
      />
      <button
        style={{ backgroundImage: `url("img/2.jpg")` }}
        onClick={() => handleClick(2)}
      />
      <button
        style={{ backgroundImage: `url("img/3.jpg")` }}
        onClick={() => handleClick(3)}
      />
      <button
        style={{ backgroundImage: `url("img/4.jpg")` }}
        onClick={() => handleClick(4)}
      />
      <button
        style={{ backgroundImage: `url("img/5.jpg")` }}
        onClick={() => handleClick(5)}
      />
      <button
        style={{ backgroundImage: `url("img/6.jpg")` }}
        onClick={() => handleClick(6)}
      />
      <button
        style={{ backgroundImage: `url("img/7.jpg")` }}
        onClick={() => handleClick(7)}
      />
    </div>
  );
}
