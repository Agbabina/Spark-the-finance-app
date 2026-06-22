using Backend.Models;
using Fleck;
using System.Collections.Concurrent;

namespace Backend.Services;

public class BudgetRoomService
{
    private readonly ConcurrentDictionary<string, List<IWebSocketConnection>> _rooms = new();
    
    public void AddUserToRoom(string budgetId, IWebSocketConnection socket)
    {
        _rooms.AddOrUpdate(
            budgetId,
            new List<IWebSocketConnection> {socket},
            (key, existingList)=>{
                lock  (existingList) {existingList.Add(socket); }
                return existingList;
            }
        );
        
    }

    public void RemoveUserFromRoom(string budgetId, IWebSocketConnection socket)
    {
        if (_rooms.TryGetValue(budgetId, out var roomSockets))
        {
            lock (roomSockets)
            {
                roomSockets.Remove(socket);
                if (roomSockets.Count==0) _rooms.TryRemove(budgetId, out _);
            }
        }
    }

    public void BroadcastToPartners(string  budgetId, string rawJson, IWebSocketConnection sender)
    {
        if (_rooms.TryGetValue(budgetId, out var roomSockets)){
            lock (roomSockets)
            {
                foreach (var client in roomSockets)
                {
                    if (client !=sender && client.IsAvailable)
                    {
                        client.Send(rawJson);
                    }
                }
            }
        }
    }
}